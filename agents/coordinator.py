"""
Coordinator module for CyberFusion AI.
This module acts as the "Orchestration Layer" (as depicted in our architectural diagram) 
for the CrewAI multi-agent system.

IMPLEMENTATION & DESIGN BEHAVIORS:
- Triage Layer: First pass filters user input to prevent huge log dumps from crashing the LLM via rate limits.
- Dynamic Orchestration: Instantiates only the exact agents needed for the investigation type, 
  drastically reducing token usage and API calls.
"""

from crewai import Crew, LLM, Process

from agents.specialists import (
    create_log_agent,
    create_recon_agent,
    create_report_generator_agent,
    create_risk_analysis_agent,
    create_threat_agent,
)
from tools.mcp_integration import get_mcp_tools
from agents.tasks import (
    create_log_analysis_tasks,
    create_security_question_tasks,
    create_threat_investigation_tasks,
    create_website_analysis_tasks,
)
from agents.triage import TriageEngine


def run_investigation(
    investigation_type: str,
    user_input: str,
    llm: LLM,
) -> str:
    """
    Run an optimized investigation flow using the TriageEngine.
    
    Args:
        investigation_type: One of 'website', 'logs', 'threat', 'question'.
        user_input: The URL, logs, IOC, or question from the user.
        llm: The configured LLM instance.

    Returns:
        The final report as a string.
    """
    
    # Pre-process the input to filter out noise and prevent rate limits
    filtered_input = TriageEngine.process(investigation_type, user_input)

    # Dynamically load Shodan/VirusTotal MCP tools if configured
    mcp_tools = get_mcp_tools()

    agents = []
    
    # We always need the report writer
    report_writer = create_report_generator_agent(llm)

    if investigation_type == "website":
        recon = create_recon_agent(llm, mcp_tools)
        threat_intel = create_threat_agent(llm, mcp_tools)
        risk_assessor = create_risk_analysis_agent(llm)
        
        agents = [recon, threat_intel, risk_assessor, report_writer]
        
        tasks = create_website_analysis_tasks(
            filtered_input,
            recon,
            threat_intel,
            risk_assessor,
            report_writer,
        )
        
    elif investigation_type == "logs":
        log_auditor = create_log_agent(llm, mcp_tools)
        threat_intel = create_threat_agent(llm, mcp_tools)
        
        agents = [log_auditor, threat_intel, report_writer]
        
        tasks = create_log_analysis_tasks(
            filtered_input,
            log_auditor,
            threat_intel,
            report_writer,
        )
        
    elif investigation_type == "threat":
        recon = create_recon_agent(llm, mcp_tools)
        threat_intel = create_threat_agent(llm, mcp_tools)
        risk_assessor = create_risk_analysis_agent(llm)
        
        agents = [recon, threat_intel, risk_assessor, report_writer]
        
        tasks = create_threat_investigation_tasks(
            filtered_input,
            recon,
            threat_intel,
            risk_assessor,
            report_writer,
        )
        
    elif investigation_type == "question":
        agents = [report_writer]
        
        tasks = create_security_question_tasks(
            filtered_input,
            report_writer,
        )
    else:
        raise ValueError(f"Unknown investigation type: {investigation_type}")

    # Build the sequential crew
    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()
    return str(result.raw) if hasattr(result, "raw") else str(result)
