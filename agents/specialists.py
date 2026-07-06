"""
Specialist agent definitions for CyberFusion AI matching the new SOC agent flow.
Each function returns a configured CrewAI Agent bound to the given LLM.
"""

from crewai import Agent, LLM

from tools.history_lookup import HistoryLookupTool
from tools.web_scraper import WebScraperTool
from tools.alienvault_otx import AlienVaultOTXTool
from tools.urlscan import UrlscanTool


def create_recon_agent(llm: LLM, mcp_tools: list = None) -> Agent:
    """Recon Agent — Data extraction specialist that pulls structured indicators from raw input."""
    tools = [AlienVaultOTXTool(), UrlscanTool()]
    if mcp_tools:
        tools.extend(mcp_tools)
    return Agent(
        role="Security Data Extractor",
        goal=(
            "Extract structured intelligence from the raw inputs, including IP addresses, "
            "domain names, file hashes, timestamps, requested URLs, user agents, and status codes."
        ),
        backstory=(
            "You are a forensic data specialist. You are highly detail-oriented and "
            "specialize in parsing unstructured security logs, alert feeds, and text files "
            "to extract clean, structured lists of technical identifiers (IOCs)."
        ),
        tools=tools,
        llm=llm,
        verbose=True,
    )


def create_threat_agent(llm: LLM, mcp_tools: list = None) -> Agent:
    """Threat Agent — Threat intelligence specialist that classifies attack vectors."""
    tools = [AlienVaultOTXTool()]
    if mcp_tools:
        tools.extend(mcp_tools)
    return Agent(
        role="Threat Intelligence Specialist",
        goal=(
            "Classify the threat vector, identify known malicious campaigns or signatures, "
            "reference threat feeds, and map technical findings to MITRE ATT&CK techniques."
        ),
        backstory=(
            "You are a senior threat analyst. You analyze threat metrics, classify attack "
            "patterns (e.g. brute force, scanning, DDoS, injection), identify actor intent, "
            "and map threat behaviors to the MITRE ATT&CK framework."
        ),
        tools=tools,
        llm=llm,
        verbose=True,
    )


def create_log_agent(llm: LLM, mcp_tools: list = None) -> Agent:
    """Log Agent — Log and system auditor that analyzes timelines and anomalies, and scans web assets."""
    tools = [WebScraperTool()]
    if mcp_tools:
        tools.extend(mcp_tools)
    return Agent(
        role="Log and Asset Auditor",
        goal=(
            "Analyze security events, build incident timelines, identify behavioral anomalies, "
            "and inspect web applications or security headers to evaluate security posture."
        ),
        backstory=(
            "You are a system audit and log correlation expert. You trace security timelines, "
            "identify traffic spikes or access patterns, and evaluate web server configurations "
            "using scanning tools to detect exposed assets or vulnerable endpoints."
        ),
        tools=tools,
        llm=llm,
        verbose=True,
    )


def create_risk_analysis_agent(llm: LLM) -> Agent:
    """Risk Analysis Agent — Assess risks and explain technical findings in plain language."""
    return Agent(
        role="Cybersecurity Risk Assessor",
        goal=(
            "Evaluate technical vulnerabilities and threats to produce an overall risk assessment. "
            "Assign a severity rating (Low, Medium, High, Critical), calculate a risk score (1-100), "
            "determine business impact, and explain the threat in clear, non-technical language."
        ),
        backstory=(
            "You are a CISO advisor. Your specialty is risk communication. You take complex "
            "technical security breaches and explain their business risk, operational impact, "
            "and financial consequences in plain language that executives can understand."
        ),
        llm=llm,
        verbose=True,
    )


def create_compliance_agent(llm: LLM) -> Agent:
    """Compliance Agent — Maps findings to compliance frameworks (SOC 2, GDPR, PCI-DSS, etc.)."""
    return Agent(
        role="Security Compliance Auditor",
        goal=(
            "Map all identified security findings, vulnerabilities, and misconfigurations "
            "to industry regulatory compliance frameworks including SOC 2, PCI-DSS, GDPR, "
            "HIPAA, and NIST CSF. Identify specific control gaps or framework violations."
        ),
        backstory=(
            "You are a certified security compliance officer and auditor. You possess deep "
            "knowledge of global compliance requirements. You map vulnerability vectors to "
            "regulatory controls, ensuring organizations understand their audit liability."
        ),
        llm=llm,
        verbose=True,
    )


def create_report_generator_agent(llm: LLM) -> Agent:
    """Report Generator — Formats findings into a professional executive report."""
    return Agent(
        role="Security Report Architect",
        goal=(
            "Format the consolidated findings from the specialist agents into a clean, "
            "professional, executive-ready incident report in Markdown format. Organize "
            "content logically with structured sections and tables."
        ),
        backstory=(
            "You are a technical writer specializing in security reports. You compile "
            "evidence, risk ratings, compliance checks, and timelines into structured, "
            "polished Markdown documents designed for executive and stakeholder presentation."
        ),
        llm=llm,
        verbose=True,
    )


def create_memory_agent(llm: LLM) -> Agent:
    """Memory Agent — Cross-references incidents with database history and checks for recurring threats."""
    return Agent(
        role="Historical Threat Analyst",
        goal=(
            "Query the past incident database using search tools to identify repeat attacker IPs, "
            "recurring vulnerability patterns, or previous scans on the same target. Summarize "
            "how the current incident relates to historical patterns."
        ),
        backstory=(
            "You manage the SOC's incident database. You check historical logs to detect "
            "recurring campaigns, persistent threat groups targeting the company, and ensure "
            "that every investigation maintains proper historical continuity."
        ),
        tools=[HistoryLookupTool()],
        llm=llm,
        verbose=True,
    )
