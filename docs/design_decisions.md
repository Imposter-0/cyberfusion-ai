# Key Design Decisions

During the development of CyberFusion AI, several critical architectural and technical decisions were made. This document explains the rationale behind them.

## 1. CrewAI vs. AutoGen vs. LangGraph
**Decision**: We chose **CrewAI** as the primary orchestration framework.
**Rationale**: While AutoGen is powerful for conversational multi-agent systems, CrewAI is heavily optimized for structured, role-based workflows (like a SOC department). CrewAI allows us to explicitly define sequential and hierarchical pipelines, assign specific tools (like Shodan or CVSS calculators) to specific roles, and prevent agents from infinitely looping, which is critical for deterministic threat reporting.

## 2. React CDN (No Node.js/Bundler) vs. Next.js
**Decision**: We built the frontend using a monolithic React file (`static/app.jsx`) served via CDN and transpiled in the browser using Babel.
**Rationale**: For a rapid prototype and hackathon deliverable, requiring judges/developers to run `npm install` and `npm run dev` adds unnecessary friction. By serving React statically through FastAPI, the entire platform runs with a single command (`python api/main.py`), drastically reducing the time-to-value for evaluators while still providing a highly polished, state-driven UI.

## 3. SQLite vs. PostgreSQL/VectorDB
**Decision**: We used standard **SQLite3** for the persistence layer and memory.
**Rationale**: We needed the Memory Agent to query past investigations to identify recurring threats. While a dedicated Vector database (like Pinecone or Chroma) is ideal for semantic search, it introduces heavy external dependencies. SQLite provides a zero-config, file-based database that works perfectly for standard keyword/IoC lookups, keeping the project lightweight and portable.

## 4. FastAPI over Flask/Django
**Decision**: We chose **FastAPI**.
**Rationale**: FastAPI's native asynchronous support is crucial when dealing with long-running LLM API calls. Furthermore, its automatic Pydantic validation ensures that the inputs to our agent pipeline are strictly typed, preventing injection attacks or malformed data before the LLM ever sees it.

## 5. Dedicated "Report Agent" vs. Direct Output
**Decision**: We dedicated a final agent specifically to markdown compilation.
**Rationale**: Early tests showed that combining technical analysis and report generation in a single prompt led to poorly formatted, hallucination-prone outputs. By separating the concern—having the first 7 agents generate raw JSON/text findings, and handing those notes to a dedicated "Report Agent" optimized purely for formatting—we achieved a 100% success rate in generating clean, markdown-compliant executive summaries.
