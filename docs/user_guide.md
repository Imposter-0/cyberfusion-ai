# User Guide

Welcome to the CyberFusion AI SOC Threat Analyst platform. This guide will walk you through the primary features and workflows of the application.

## 1. Dashboard Overview
Upon logging in, you are greeted by the **Dashboard**. This serves as your command center:
- **Executive Summary**: A quick health check of the platform.
- **Key Metrics**: View system uptime, total investigations run, SQLite vector records, and loaded MCP modules.
- **Threat Feed**: A scrolling feed of recent mock threat alerts.
- **MITRE ATT&CK Mapping**: A visual breakdown of common threat vectors and their severity.
- **Active Reports**: A quick table of your most recent investigations.

## 2. Running an Investigation
To launch a new threat analysis, click the **Investigate** tab in the top navigation.

1. **Select an Investigation Channel**:
   - *Website Analysis*: Scan URLs for SSL configs and security headers.
   - *Security Logs*: Audit server access logs or firewall dumps.
   - *Threat Intelligence*: Investigate specific IPs, domains, or file hashes.
   - *Ask a Question*: Query compliance matrices (NIST, HIPAA).
2. **Enter Parameters**: Paste your data into the input box. You can use the "Quick Test" links below the input to load sample data.
3. **Launch**: Click **Launch Crew Investigation**.
4. **Observe**: The visual pipeline will activate. You will see 8 distinct AI specialist nodes light up as they process your data in real-time. You can view their individual thoughts and console logs as they work.

## 3. Viewing the Report
Once an investigation completes, a **Success Banner** will appear, and the Markdown report will render below it.

- Use the **Tabs** (Technical, Executive, Compliance, Risk) to view the report formatted for different audiences.
- Click **Download PDF** to export the current view as a PDF document for sharing with stakeholders.

## 4. Auditing History
Navigate to the **History** tab to view the SQLite database registry of all past investigations.
- Use the **Search Logs** box to filter by ID or keyword.
- Use the **Pipeline Filter** or **Severity Filter** to narrow down results.
- Click any row in the table to open the detailed drawer on the right side and view the full historical report.

## 5. System Settings
Navigate to the **Settings (gear icon)** to configure the platform.
- Input your **OpenAI API Key** (required).
- Input optional keys for Shodan and VirusTotal.
- Use the **Wipe SQLite Registry** button to clear the database (Use with caution!).
