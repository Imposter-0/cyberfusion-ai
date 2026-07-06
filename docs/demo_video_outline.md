# Demo Video Script (5-Minute Hackathon Submission)

This script is strictly structured to hit all 5 required sections in the 5-minute limit, guaranteeing maximum points for Category 1.

## 1. Problem Statement (0:00 - 0:45)
- **Visual**: Title slide transitioning into an infographic of a stressed SOC analyst drowning in alerts.
- **Narration**: "Hello judges, this is CyberFusion AI. Today, Security Operations Center (SOC) analysts are facing massive burnout. The core problem is alert fatigue and context switching. When a threat comes in, analysts manually pivot between SIEMs, VirusTotal, Shodan, and compliance spreadsheets to figure out what happened. This manual triage takes hours, leading to delayed incident response and missed breaches."

## 2. Why Agents? (0:45 - 1:30)
- **Visual**: Show the agent specialization diagram (`docs/agents.md`) highlighting the 8 different roles.
- **Narration**: "To solve this, we didn't just wrap an LLM in a chatbot UI. We used a multi-agent system. Why agents? Because incident response is inherently role-based. A single LLM gets confused trying to analyze code, calculate CVSS scores, and write executive summaries all at once. By deploying 8 specialized agents—a Recon agent, a Threat analyst, a Compliance mapper—we simulate an entire SOC department that collaborates sequentially, yielding deterministic, hallucination-free intelligence."

## 3. Architecture (1:30 - 2:30)
- **Visual**: Show the System Architecture diagram (`docs/architecture.md`) and the Tool Flow diagram.
- **Narration**: "Our architecture consists of three layers. The presentation layer is a React frontend. The gateway is a FastAPI Python backend utilizing `slowapi` for rate-limiting and robust prompt-injection blocking for security. The orchestration layer runs on CrewAI. Crucially, our agents don't just guess—they interact with the real world using the Model Context Protocol (MCP). We integrated Shodan and VirusTotal MCP servers, allowing our threat agents to securely fetch live network intelligence during their investigations."

## 4. Live Demo (2:30 - 4:00)
- **Visual**: Open `http://localhost:8000`. Navigate the dashboard, launch a Website Analysis investigation against a mock URL, and watch the pipeline run. Show the final report and the SQLite History tab.
- **Narration**: "Let's see it in action. I'm submitting a suspicious IP to the platform. Watch the visual HUD—you can see our CrewAI agents working in real-time. The Recon agent extracts the IP, passing it to the Threat agent, who queries the VirusTotal MCP. The Risk agent calculates the CVSS score, and finally, the Report agent formats a board-ready Markdown document. All of this context is persisted to a local SQLite database, allowing our Memory Agent to recognize if this IP attacks us again in the future."

## 5. The Build (4:00 - 5:00)
- **Visual**: Show a split screen of the React code, the FastAPI backend, and the `.agents/AGENTS.md` file. End on a "Deployable / GitHub" slide.
- **Narration**: "We built CyberFusion AI using React, Tailwind, FastAPI, and CrewAI. A key part of our journey was utilizing the **Antigravity AI agent** to pair-program the platform, employing advanced agent skills to define project-scoped rules in our `.agents` directory to enforce commercial-grade code quality. Finally, the entire application is highly deployable. Because the React frontend is statically served by FastAPI, the entire platform runs via a single Docker container or a simple `python api/main.py` command, making it incredibly easy to deploy to any cloud provider. Thank you."
