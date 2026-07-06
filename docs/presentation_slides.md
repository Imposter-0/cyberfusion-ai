# Presentation Slides Outline

This document provides a structure and speaker notes for a 10-slide pitch deck for the hackathon presentation.

## Slide 1: Title
- **Visual**: CyberFusion AI Logo (Shield + Green Accents)
- **Text**: "CyberFusion AI: Multi-Agent SOC Threat Intelligence & Incident Response Platform"
- **Speaker Notes**: "Good morning judges. We are excited to present CyberFusion AI, a platform that redefines how Security Operations Centers handle threat intelligence by utilizing a multi-agent AI squad."

## Slide 2: The Problem
- **Visual**: Overwhelmed SOC analyst / alert fatigue infographic.
- **Text**: 
  - Alert Fatigue: 70% of SOC analysts report burnout.
  - Context Switching: Analysts manually pivot between 10+ tools (Shodan, VT, SIEM, Docs).
  - Slow Response Time: Manual compliance and risk scoring takes hours.
- **Speaker Notes**: "Today's SOC analysts are drowning in alerts. They spend hours manually pulling IPs, checking VirusTotal, calculating CVSS scores, and writing executive reports. It's slow and leads to burnout."

## Slide 3: The Solution (CyberFusion AI)
- **Visual**: App Dashboard screenshot.
- **Text**: 
  - Automated Orchestration: 1 prompt = 8 specialized AI agents working in tandem.
  - Instant Context: Real-time integration with external MCP tools.
  - Automated Reporting: Generates PDF reports tailored for Tech, Exec, and Risk audiences.
- **Speaker Notes**: "CyberFusion AI solves this by introducing a decentralized, multi-agent Crew. You provide a single log or IP, and our 8 specialist agents instantly triage, analyze, map compliance, and generate a polished PDF report."

## Slide 4: Meet the Crew
- **Visual**: Architecture/Agent mapping diagram (from `docs/agents.md`).
- **Text**: 
  - Coordinator, Recon, Threat, Log
  - Risk, Compliance, Memory, Report
- **Speaker Notes**: "We don't just use one large LLM prompt. We use CrewAI to simulate an entire SOC department. The Recon agent extracts hashes, the Risk agent calculates CVSS, the Compliance agent maps to HIPAA, and the Memory agent checks our local SQLite history for recurring attacks."

## Slide 5: Tech Stack
- **Visual**: Tech logos (React, Tailwind, FastAPI, CrewAI, Python, SQLite, OpenAI).
- **Text**: 
  - Frontend: React + Tailwind CSS (Vite/CDN)
  - Backend: FastAPI (Python)
  - Orchestration: CrewAI + Langchain
  - Storage: SQLite3 Vector Memory
- **Speaker Notes**: "We built this with a modern, lightweight stack. React on the frontend ensures a seamless, highly-polished UI. FastAPI provides a robust, typed backend, and CrewAI manages the agent orchestration over OpenAI's models."

## Slide 6: Key Features: Live Investigation
- **Visual**: GIF or Screenshot of the active pipeline animation.
- **Text**: Real-time agent thought processing, visual pipeline HUD, dynamic error catching.
- **Speaker Notes**: "Our UI doesn't just show a spinner. It provides a visual HUD of the pipeline, showing exactly what each agent is thinking and doing in real-time, building trust with the human operator."

## Slide 7: Key Features: History & Persistence
- **Visual**: Screenshot of the History/Database tab.
- **Text**: SQLite persistence, instant recall, advanced filtering.
- **Speaker Notes**: "Every investigation is saved to a local SQLite database. Our Memory agent actually queries this database during live investigations to flag if a specific IP or threat actor has attacked us before."

## Slide 8: Security & Production Readiness
- **Visual**: Code snippets showing rate limiting and SSRF protection.
- **Text**: 
  - Prompt Injection Blocking
  - SlowAPI Rate Limiting (5 req/min)
  - SSRF Protection on Web Scrapers
  - Clean Architecture & Robust Error Handling
- **Speaker Notes**: "We didn't just build a prototype; we built it securely. We implemented rate limiting, strict prompt injection blocking, and SSRF prevention to ensure the platform is enterprise-ready."

## Slide 9: Future Roadmap
- **Visual**: Timeline graphic.
- **Text**: 
  - Active Remediation (Automated firewall blocking via API)
  - Native SIEM Integrations (Splunk, Elastic)
  - Local LLM Support (Ollama / Llama3) for total data privacy.
- **Speaker Notes**: "In the future, we plan to add active remediation capabilities, allowing agents to push firewall rules, and local LLM support for air-gapped environments."

## Slide 10: Q&A
- **Visual**: Team photo / contact info.
- **Text**: Thank you! Questions?
- **Speaker Notes**: "Thank you for your time. We are now open for questions and a live demo."
