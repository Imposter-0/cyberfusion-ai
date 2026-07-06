# CyberFusion AI: Project Overview

## 1. The Problem
In modern cybersecurity, Security Operations Centers (SOC) are the frontline defense against cyber threats. However, SOC analysts are currently facing unprecedented levels of burnout due to "alert fatigue." When a suspicious event occurs (e.g., a firewall block, a malware signature detection), the analyst must manually pivot between a dozen disconnected tools—querying IP addresses in Shodan, checking file hashes in VirusTotal, calculating CVSS impact scores, and cross-referencing compliance mandates (like SOC 2 or HIPAA). This manual, highly repetitive context-switching takes hours per incident, resulting in delayed response times that give attackers the window they need to breach a network.

## 2. The Solution
CyberFusion AI solves this problem by completely automating the threat triage and intelligence-gathering process using a multi-agent AI system. 

Instead of wrapping an LLM in a basic chatbot interface, we deployed a "Crew" of 8 specialized AI agents (Recon, Threat, Log, Risk, Compliance, Report, Memory, and Coordinator). By providing the platform with a single indicator of compromise (IoC)—such as a URL, a log file, or an IP address—the system orchestrates a sequential investigation. The agents autonomously extract data, query external threat intelligence feeds, map the attack to the MITRE ATT&CK framework, and generate a board-ready, multi-audience (Technical, Executive, Compliance) PDF report. What used to take a human analyst three hours now takes our agentic squad less than sixty seconds.

## 3. The Architecture
CyberFusion AI utilizes a modern, modular, and highly secure architecture:

- **Frontend (Presentation Layer)**: Built with React and Tailwind CSS. To maximize deployability, the React app is a monolithic file served statically via CDN. It provides a real-time visual HUD of the agent pipeline, allowing human operators to monitor the AI's "thoughts" to build operational trust.
- **Backend (API Gateway Layer)**: Built with FastAPI (Python). The backend serves as a secure gateway, implementing strict rate-limiting (`slowapi`) and regex-based prompt-injection defense to prevent malicious actors from jailbreaking the LLM orchestration.
- **Orchestration & Data Layer (AI Core)**: Powered by CrewAI and Langchain. The multi-agent squad utilizes the **Model Context Protocol (MCP)** to securely interact with the outside world, dynamically spinning up Shodan and VirusTotal MCP servers as native tools.
- **Memory & Persistence**: A local SQLite database tracks every investigation. Our dedicated "Memory Agent" queries this database during live investigations to flag if a threat actor has attacked the organization previously.

## 4. The Journey & The Build
Building CyberFusion AI was an exercise in balancing AI autonomy with strict security guardrails. 

Our initial prototype used a single, massive LLM prompt to analyze threats. We quickly realized this led to hallucinations and context-collapse; the LLM couldn't simultaneously calculate a risk score and format a Markdown report effectively. This led to our pivotal decision to implement a multi-agent architecture using CrewAI, separating concerns so each agent excels at one specific SOC role.

Throughout the build, we heavily utilized the **Antigravity AI agent** for pair programming. By defining project-scoped behaviors using Agent Skills (in our `.agents/AGENTS.md` directory), we ensured that the AI assistant adhered to strict commercial-grade coding standards, never breaking existing APIs during refactors. 

Finally, we focused heavily on deployability. By serving the transpiled React code directly through FastAPI, the entire multi-agent platform can be launched locally or deployed to the cloud via a single command (`python api/main.py`), requiring zero complex Node.js build steps. CyberFusion AI is secure, scalable, and ready to revolutionize the modern SOC.
