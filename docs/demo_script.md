# Live Demo Script

This script provides a chronological walkthrough for a live hackathon presentation.

## Setup (Before presenting)
1. Start FastAPI server (`python api/main.py`).
2. Open `http://localhost:8000` in fullscreen mode.
3. Ensure `.env` is loaded or API keys are set in the UI Settings.
4. Pre-populate the SQLite database with 1 or 2 historical logs (by running quick investigations beforehand) so the History tab isn't empty.

## 0:00 - Introduction & Dashboard
**Speaker**: "Welcome to CyberFusion AI. We are looking at the SOC Analyst Dashboard."
**Action**: Slowly scroll through the Dashboard.
**Speaker**: "At a glance, an analyst can see system health, active agent status, and the latest threat feeds. But let's see what happens when a new threat comes in."

## 0:30 - Launching an Investigation
**Action**: Click the "Investigate" tab. Select "Security Logs".
**Speaker**: "Let's say our firewall just blocked a suspicious SSH connection, and we need to investigate. I'll paste the raw syslog output here."
**Action**: Click the "FW Auth block" quick-test link to populate the textarea.
**Speaker**: "I click 'Launch Crew Investigation'."
**Action**: Click the Launch button.

## 1:00 - The Agent Pipeline
**Speaker**: "Instead of one basic LLM response, we've deployed an entire Crew of 8 specialized agents. Watch the visual HUD."
**Action**: Let the animation play. Point to the screen.
**Speaker**: "The Coordinator splits the task. The Recon Agent extracts the IP. The Log agent checks the port. The Threat Agent queries external feeds like VirusTotal."
**Action**: Scroll down slightly so the UI is centered on the active agent cards.
**Speaker**: "Notice the live terminal logs — the analyst retains full visibility into what the AI is doing, which builds operational trust."

## 1:45 - The Report
**Action**: The pipeline completes, and the Success Banner appears. Scroll down to the report.
**Speaker**: "In seconds, the investigation is complete. The Report Agent has compiled a comprehensive markdown document."
**Action**: Click through the tabs: Technical, Executive, Compliance.
**Speaker**: "We can view technical details, or instantly pivot to an Executive summary for management, or a Compliance mapping for auditors."

## 2:15 - History & Persistence
**Action**: Click the "History" tab.
**Speaker**: "Because SOCs need context, every incident is saved to our local SQLite Memory database."
**Action**: Click on the top row to open the side panel.
**Speaker**: "Our Memory Agent actively queries this database during new investigations to identify if an IP has attacked us before."

## 2:45 - Settings & Security
**Action**: Click the "Settings" gear icon.
**Speaker**: "Finally, the platform is highly secure. API keys are managed locally, and the backend employs strict rate limiting, SSRF protection, and Prompt Injection safeguards to ensure the agents cannot be manipulated."

## 3:00 - Conclusion
**Speaker**: "CyberFusion AI transforms hours of manual SOC triage into seconds of automated, multi-agent intelligence. Thank you."
