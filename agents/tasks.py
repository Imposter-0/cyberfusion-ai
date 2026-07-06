"""
Task factories for each investigation type in CyberFusion AI matching the optimized SOC flow.
Each function returns a list of CrewAI Tasks forming a sequential dependency DAG.
"""

from crewai import Agent, Task


def create_website_analysis_tasks(
    url: str,
    recon_agent: Agent,
    threat_agent: Agent,
    risk_analysis_agent: Agent,
    report_generator_agent: Agent,
) -> list[Task]:
    """Create the optimized SOC chain for website security analysis."""

    recon_task = Task(
        description=(
            f"Analyze the target URL: '{url}' and extract key details: protocol (HTTP/HTTPS), "
            "domain name, ports implied, and organize them into structural indicators."
        ),
        expected_output="Structured details of the URL including domain, scheme, and basic indicators.",
        agent=recon_agent,
    )

    threat_task = Task(
        description=(
            "Analyze the web scan findings to identify potential attack vectors.\n"
            "What web attacks are possible (e.g. Clickjacking, XSS, MITM)?\n"
            "Map findings to OWASP Top 10 categories and MITRE ATT&CK techniques where possible."
        ),
        expected_output="Threat classification, potential attack vectors, and MITRE ATT&CK mappings.",
        agent=threat_agent,
        context=[recon_task],
    )

    risk_task = Task(
        description=(
            "Assess the risk posed by the website vulnerabilities.\n"
            "Calculate a risk score (1-100), assign an overall severity (Low / Medium / High / Critical),\n"
            "describe business and operational impact, and explain findings in clear, non-technical language."
        ),
        expected_output="Risk score, severity, business impact, and plain-language executive risk summary.",
        agent=risk_analysis_agent,
        context=[threat_task],
    )

    report_task = Task(
        description=(
            f"Generate a comprehensive website security report for: {url}.\n"
            "Include:\n"
            "1. **Executive Summary** — plain-language risk overview\n"
            "2. **Target Details** — domain, host, technology\n"
            "3. **Threat Classification & MITRE ATT&CK** — attack vectors\n"
            "4. **Risk Assessment** — severity badge, score (1-100), impact\n"
            "5. **Remediation Steps** — prioritized recommendations"
        ),
        expected_output="A polished, executive-ready Markdown report compiled from all prior analysis.",
        agent=report_generator_agent,
        context=[recon_task, threat_task, risk_task],
    )

    return [recon_task, threat_task, risk_task, report_task]


def create_log_analysis_tasks(
    logs: str,
    log_agent: Agent,
    threat_agent: Agent,
    report_generator_agent: Agent,
) -> list[Task]:
    """Create the optimized SOC chain for security log analysis."""

    log_task = Task(
        description=(
            f"Analyze the extracted logs to identify anomalous patterns:\n\n{logs}\n\n"
            "Correlate events, build a precise timeline of activities, trace scan bursts, "
            "and check for credential stuffing, brute force, or directory traversal signatures."
        ),
        expected_output="Anomalous event timeline, frequency metrics, and timing correlation patterns.",
        agent=log_agent,
    )

    threat_task = Task(
        description=(
            "Classify the threat vector represented by the log activities (e.g. SSH brute force, SQL injection, "
            "DDoS, automated path traversal). Reference indicators of compromise (IOCs) and map behavior "
            "to MITRE ATT&CK techniques."
        ),
        expected_output="Threat vector classification, MITRE ATT&CK tactics, and confirmed indicators (IOCs).",
        agent=threat_agent,
        context=[log_task],
    )

    report_task = Task(
        description=(
            "Create a comprehensive incident response log analysis report in Markdown format.\n"
            "Include:\n"
            "1. **Executive Summary** — plain-language incident summary\n"
            "2. **Event Timeline** — chronologically reconstructed attack chain\n"
            "3. **Technical Findings** — detailed parsing of anomalies\n"
            "4. **Threat Classification & MITRE ATT&CK** — vector and techniques\n"
            "5. **Remediation Steps** — block rules, patch recommendations, log controls"
        ),
        expected_output="A polished, professional Markdown log analysis report suitable for executive review.",
        agent=report_generator_agent,
        context=[log_task, threat_task],
    )

    return [log_task, threat_task, report_task]


def create_threat_investigation_tasks(
    ioc: str,
    recon_agent: Agent,
    threat_agent: Agent,
    risk_analysis_agent: Agent,
    report_generator_agent: Agent,
) -> list[Task]:
    """Create the optimized SOC chain for investigating a specific IOC (IP, domain, hash)."""

    recon_task = Task(
        description=(
            f"Analyze the IOC input: '{ioc}'. Determine its type (IP, domain, hash, URL) "
            "and extract related sub-indicators or format specifics."
        ),
        expected_output="Normalized IOC type classification and structural format specifics.",
        agent=recon_agent,
    )

    threat_task = Task(
        description=(
            f"Research threat intelligence details for: '{ioc}'.\n"
            "Identify known actor groups (APTs), threat campaigns, malware families associated with it,\n"
            "and map threat behaviors to MITRE ATT&CK techniques."
        ),
        expected_output="Threat intel details, known APT groups, campaign correlations, and MITRE mapping.",
        agent=threat_agent,
        context=[recon_task],
    )

    risk_task = Task(
        description=(
            "Assess the exposure risk of the organization to this IOC.\n"
            "Calculate a risk score (1-100), assign overall severity, business impact, "
            "and explain the risk factor in clear, plain language."
        ),
        expected_output="Severity rating, risk score, business exposure analysis, and plain-language summary.",
        agent=risk_analysis_agent,
        context=[threat_task],
    )

    report_task = Task(
        description=(
            f"Create a threat investigation report in Markdown format for indicator: {ioc}.\n"
            "Include:\n"
            "1. **Executive Summary** — overview of the indicator risk\n"
            "2. **IOC Details** — classification, type, and format\n"
            "3. **Threat Intelligence** — threat actors, malware associations, MITRE ATT&CK\n"
            "4. **Risk Assessment** — severity badge, score (1-100), exposure risk\n"
            "5. **Remediation & Blocklist Actions** — firewall blocklist, IP blocks, hash matching rules"
        ),
        expected_output="A polished Markdown threat intelligence report on the IOC suitable for SOC presentation.",
        agent=report_generator_agent,
        context=[recon_task, threat_task, risk_task],
    )

    return [recon_task, threat_task, risk_task, report_task]


def create_security_question_tasks(
    question: str,
    report_generator_agent: Agent,
) -> list[Task]:
    """Create the optimized SOC chain for answering a security question."""

    report_task = Task(
        description=(
            f"Answer the following security question: '{question}'\n"
            "Format the security research into a polished Markdown response. Include:\n"
            "1. **Summary Response** — 2-3 sentence overview\n"
            "2. **Detailed Breakdown** — technical analysis\n"
            "3. **Threat Landscape & MITRE ATT&CK** — associated attacks\n"
            "4. **Risk & Business Impact** — severity rating and mitigation logic\n"
            "5. **Best Practices & Actionable Guidelines** — checklists"
        ),
        expected_output="A clean, structured Markdown response suitable for developer or executive guidance.",
        agent=report_generator_agent,
    )

    return [report_task]
