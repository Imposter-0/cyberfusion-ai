# 🛡️ CyberFusion AI — Project Status Summary

This file summarizes the features, architecture, and code assets currently implemented in the **CyberFusion AI v2.0** multi-agent SOC platform.

---

## 🚀 Active Features

1. **Dashboard & Routing**: Landing page with custom glassmorphism, glowing cyan theme, sidebar navigation, system status metrics, and an active SOC agent counter.
2. **SOC 8-Agent Pipeline**: Coordinates a sequential multi-agent squad to execute 7 connected tasks per investigation (Recon → Log Audit → Threat Intel → Risk Assessor → Compliance → Report Writer → Memory).
3. **4 Specialized Investigations**:
   * 🌐 **Website Analysis** — Scan security headers, SSL status, and technology metadata.
   * 📋 **Log Analysis** — Parse raw syslog/auth logs, identify anomalies, and build intrusion timelines.
   * 🔍 **Threat Investigation** — Probe specific IPs, domains, and malware file hashes.
   * 💬 **Security Q&A** — Deliver educational cybersecurity guidance mapped to industry guidelines.
4. **API Key Persistence**: Allows saving the OpenAI API key to a local `.env` file via the sidebar, which automatically pre-fills on app start.
5. **Incident Memory Store**: Automatically logs every investigation to a local SQLite database, extracting severity and timestamp details.
6. **Fallback-Safe MCP Tools**: Integrates optional loading for **Shodan** and **VirusTotal** MCP servers. Bypasses cleanly if dependencies are missing, displaying instructions in the sidebar.

---

## 📁 Code Directory Structure

```
cyberfusion-ai/
├── app.py                    # App entry point, sidebar metrics, dotenv loading, page router
├── requirements.txt          # App dependencies (streamlit, crewai, python-dotenv, bs4, requests)
├── .streamlit/
│   └── config.toml          # Default headless config & custom dark theme styling
├── memory/
│   ├── __init__.py
│   └── store.py              # SQLite storage (investigations.db) & auto-severity extractor
├── tools/
│   ├── __init__.py
│   ├── web_scraper.py        # Web scanning tool (security headers, certificate validation)
│   ├── history_lookup.py     # SQL search tool enabling Memory Agent to find repeat attackers
│   └── mcp_integration.py    # Fallback-safe npx loaders for Shodan & VirusTotal MCP servers
├── agents/
│   ├── __init__.py
│   ├── specialists.py        # Roster of the 7 SOC specialist agents (roles, goals, backstories)
│   ├── tasks.py              # Factory for the 7-task execution chains per investigation
│   └── coordinator.py        # Crew constructor linking agents, tasks, and loading MCP tools
├── ui/
│   ├── __init__.py
│   ├── styles.py             # Premium dark styling (animations, grids, custom cards)
│   ├── dashboard.py          # Dashboard landing & "Why Architecture Matters" benefits grid
│   ├── investigation.py      # Inputs per type, live st.status tracker, download report action
│   └── history.py            # SQLite log viewer, severity badges, metrics, individual download
└── README.md                 # Project quick start and setup guidelines
```

---

## 🤖 The SOC Agent Roster (8 Agents)

*   **Coordinator Agent** (Manager) — Creates the plan, delegates, and oversees execution.
*   **Security Data Extractor** (Recon) — Parses raw inputs to capture IPs, timestamps, and hashes.
*   **Log and Asset Auditor** (Log Auditor) — Maps security events, timelines, and runs BeautifulSoup/web scans.
*   **Threat Intelligence Specialist** (Threat Intel) — Classifies vectors and maps behavior to MITRE ATT&CK.
*   **Cybersecurity Risk Assessor** (Risk Assessor) — Scores risk (1-100) and translates findings to plain language.
*   **Security Compliance Auditor** (Compliance) — Maps security gaps to SOC 2, PCI-DSS, GDPR, HIPAA, and NIST CSF.
*   **Security Report Architect** (Report Writer) — Compiles consolidated results into executive Markdown reports.
*   **Historical Threat Analyst** (Memory) — Uses the history lookup tool to query SQLite and flag repeat attacks.

---

## 🔌 MCP Integration Status

*   **Shodan MCP** (`BurtTheCoder/mcp-shodan`) — Resolves exposed ports, host details, and CVEs for Website/IP scans.
*   **VirusTotal MCP** (`BurtTheCoder/mcp-virustotal`) — Resolves domain safety, URL scans, and file hash threat scores.
*   *Status*: **Ready**. Optional setup guidelines are configured. If you run `pip install 'crewai-tools[mcp]'` and add API keys to `.env`, the tools activate automatically.

---

## 🛠️ How to Launch the Platform

```bash
# Start the server locally
streamlit run app.py
```
*Access URL:* `http://localhost:8501`
