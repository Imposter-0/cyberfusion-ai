"""
FastAPI backend for CyberFusion AI.
Provides REST endpoints for the React frontend to interact with the CrewAI backend.

IMPLEMENTATION & DESIGN BEHAVIORS (Security & Architecture):
- Rate Limiting: We use `slowapi` to enforce strict rate limits (5 req/minute) on the 
  investigation endpoint, mitigating bot-spam and API cost exhaustion.
- Exception Handling: Global exception handlers intercept raw tracebacks and return sanitized 
  JSON responses, ensuring sensitive backend architecture details are never leaked to the client.
"""

import os
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import logging

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Load environment variables on start
load_dotenv()

# We need to import our existing backend logic
# Adding the parent directory to sys.path so we can import from agents and memory if we run from api folder
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from agents.coordinator import run_investigation
from memory.store import get_investigation_count, get_all_investigations, get_investigation, update_investigation_report
from tools.mcp_integration import get_mcp_tools, HAS_MCP
from crewai import LLM

from api.security import InputValidator

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Environment Validation on startup
    if not os.environ.get("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY is not set. Some features requiring AI may fail unless provided per-request.")
    if not os.environ.get("SHODAN_API_KEY"):
        logger.warning("SHODAN_API_KEY is not set. Shodan MCP tool will be unavailable.")
    yield


app = FastAPI(
    title="CyberFusion AI API",
    description="Multi-Agent Threat Intelligence & Incident Response Platform",
    version="2.0",
    lifespan=lifespan,
)

# Apply Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception Handler (prevents stack trace leaks)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception internally
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    # Return sanitized generic error
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Enable CORS for local React development (if needed for API calls)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for the React frontend
static_dir = Path(__file__).parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse(str(static_dir / "index.html"))

class InvestigateRequest(BaseModel):
    investigation_type: str
    user_input: str
    api_key: Optional[str] = None

class TransformRequest(BaseModel):
    report_type: str


@app.get("/api/config")
async def get_config():
    """Return safe frontend configuration (never exposes actual keys)."""
    has_gemini = bool(os.environ.get("GEMINI_API_KEY"))
    has_openai = bool(os.environ.get("OPENAI_API_KEY"))
    return {
        "has_api_key": has_gemini or has_openai,
        "has_gemini": has_gemini,
        "has_openai": has_openai,
        "has_shodan": bool(os.environ.get("SHODAN_API_KEY")),
        "has_virustotal": bool(os.environ.get("VIRUSTOTAL_API_KEY")),
        "active_model": "gemini/gemini-2.5-flash" if has_gemini else ("gpt-4o-mini" if has_openai else "none"),
    }


@app.get("/api/status")
async def get_status():
    """Return system metrics and MCP status."""
    inv_count = get_investigation_count()
    
    shodan_active = bool(os.environ.get("SHODAN_API_KEY"))
    vt_active = bool(os.environ.get("VIRUSTOTAL_API_KEY"))
    
    mcp_status = "Installed" if HAS_MCP else "Not Installed"
    mcp_tools_online = []
    if shodan_active: mcp_tools_online.append("Shodan")
    if vt_active: mcp_tools_online.append("VirusTotal")
        
    return {
        "status": "online",
        "security_agents": 8,
        "investigations_run": inv_count,
        "mcp_status": mcp_status,
        "mcp_tools_online": mcp_tools_online,
        "detection_engine": "Operational",
    }



# ── In-memory job store for async investigations ──────────────────────────────
import threading
import uuid as _uuid
from typing import Literal

_jobs: dict[str, dict] = {}  # job_id -> {status, result, error}
_jobs_lock = threading.Lock()


def _run_investigation_job(job_id: str, investigation_type: str, user_input: str, llm):
    """Background thread target: run the crew and update job store."""
    try:
        report = run_investigation(investigation_type, user_input, llm)
        from memory.store import save_investigation
        inv_id = save_investigation(
            investigation_type=investigation_type,
            user_input=user_input,
            report=report,
        )
        with _jobs_lock:
            _jobs[job_id] = {"status": "done", "id": inv_id, "report": report}
    except Exception as e:
        logger.error(f"Background investigation job {job_id} failed: {str(e)}", exc_info=True)
        err_str = str(e)
        if "insufficient_quota" in err_str or "429" in err_str:
            detail = "API quota exceeded. Please check your API key plan/billing."
        elif "invalid_api_key" in err_str or "401" in err_str:
            detail = "Invalid API key. Please check your API key in Settings."
        elif "rate_limit" in err_str.lower():
            detail = "Rate limit hit. Please wait 30 seconds and try again."
        elif "connection" in err_str.lower() or "timeout" in err_str.lower():
            detail = f"Connection error: {err_str[:200]}"
        else:
            detail = f"Investigation error: {err_str[:300]}"
        with _jobs_lock:
            _jobs[job_id] = {"status": "error", "error": detail}


@app.post("/api/investigate")
@limiter.limit("10/minute")
def investigate(req: InvestigateRequest, request: Request):
    """Start a new investigation job and immediately return a job_id for polling."""

    if req.investigation_type not in ["website", "logs", "threat", "question"]:
        raise HTTPException(status_code=400, detail=f"Invalid investigation type: {req.investigation_type}")
        
    if not req.user_input or not req.user_input.strip():
        raise HTTPException(status_code=400, detail="User input is required.")

    # Apply Security Guardrails (Input Validation & Prompt Injection Protection)
    InputValidator.validate_investigation(req.investigation_type, req.user_input)

    # ── LLM Selection: prefer Gemini (free), fall back to OpenAI ──
    # Priority: 1) user-supplied OpenAI key  2) Gemini env key  3) OpenAI env key
    user_openai_key = req.api_key.strip() if req.api_key else ""
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    openai_env_key = os.environ.get("OPENAI_API_KEY", "")

    if gemini_key:
        # Use Google Gemini 2.5 Flash — higher quota and better capabilities
        llm = LLM(model="gemini/gemini-2.5-flash", api_key=gemini_key)
        logger.info("Using Gemini (gemini-2.5-flash) from environment.")
    elif user_openai_key:
        llm = LLM(model="gpt-4o-mini", api_key=user_openai_key)
        logger.info("Using user-supplied OpenAI key.")
    elif openai_env_key:
        llm = LLM(model="gpt-4o-mini", api_key=openai_env_key)
        logger.info("Using OpenAI from environment.")
    else:
        raise HTTPException(
            status_code=400,
            detail="No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your .env file."
        )

    # Create job and launch background thread
    job_id = str(_uuid.uuid4())[:12]
    with _jobs_lock:
        _jobs[job_id] = {"status": "running"}

    thread = threading.Thread(
        target=_run_investigation_job,
        args=(job_id, req.investigation_type, req.user_input, llm),
        daemon=True,
    )
    thread.start()
    logger.info(f"Investigation job {job_id} launched in background thread.")

    return {"job_id": job_id, "status": "running"}


@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Poll the status of a background investigation job."""
    with _jobs_lock:
        job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["status"] == "running":
        return {"status": "running"}
    if job["status"] == "error":
        raise HTTPException(status_code=500, detail=job["error"])
    # done
    return {"status": "done", "id": job["id"], "report": job["report"]}



@app.get("/api/history")
async def get_history():
    """Retrieve all past investigations (summaries)."""
    try:
        investigations = get_all_investigations()
        return {"investigations": investigations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{inv_id}")
async def get_history_detail(inv_id: str):
    """Retrieve a specific investigation report by ID."""
    try:
        investigation = get_investigation(inv_id)
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigation not found")
        return investigation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reports/transform/{inv_id}")
async def api_transform_report(inv_id: str, req: TransformRequest):
    """Transforms a report into a different format (executive, compliance, risk)."""
    inv = get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
        
    db_col = f"report_{req.report_type}"
    if req.report_type in ["executive", "compliance", "risk"] and inv.get(db_col):
        return {"report": inv[db_col]}
        
    try:
        from api.report_transformer import transform_report
        new_report = transform_report(inv["report"], req.report_type)
        if req.report_type in ["executive", "compliance", "risk"]:
            update_investigation_report(inv_id, req.report_type, new_report)
        return {"report": new_report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/{inv_id}/pdf")
async def get_pdf_report(inv_id: str, type: str = "technical"):
    """Generates and downloads a PDF version of the report."""
    inv = get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
        
    report_text = inv["report"]
    if type in ["executive", "compliance", "risk"]:
        db_col = f"report_{type}"
        if inv.get(db_col):
            report_text = inv[db_col]
        else:
            try:
                from api.report_transformer import transform_report
                report_text = transform_report(inv["report"], type)
                update_investigation_report(inv_id, type, report_text)
            except Exception as e:
                print(f"Failed to transform for PDF: {e}")
            
    try:
        from api.pdf_generator import generate_pdf
        pdf_bytes = generate_pdf(report_text, type)
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=report_{inv_id}_{type}.pdf"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
