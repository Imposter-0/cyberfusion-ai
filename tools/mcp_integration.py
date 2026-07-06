"""
MCP Tool Loader for CyberFusion AI.
Provides fallback-safe integration with Shodan and VirusTotal MCP servers.

IMPLEMENTATION & DESIGN BEHAVIORS (MCP Server Architecture):
- Model Context Protocol (MCP): This module leverages the open MCP standard to connect AI agents 
  to external data sources (Shodan, VirusTotal) in a standardized, secure manner.
- StdioServerParameters: The integration runs the MCP servers as standard I/O child processes 
  (via npx), passing environment variables securely without hardcoding secrets in the codebase.
- Dynamic Tool Generation: `MCPServerAdapter.to_tools()` dynamically converts the MCP server's 
  capabilities into Langchain-compatible tools that our CrewAI specialists can invoke autonomously.
"""

import os
import logging

# Set up logging
logger = logging.getLogger("cyberfusion.mcp")

try:
    from crewai_tools import MCPServerAdapter
    from mcp import StdioServerParameters
    HAS_MCP = True
except ImportError:
    HAS_MCP = False


def get_mcp_tools() -> list:
    """
    Load tools from Shodan and VirusTotal MCP servers.
    Returns an empty list if crewai-tools[mcp] is not installed or API keys are missing.
    """
    if not HAS_MCP:
        logger.warning(
            "crewai-tools[mcp] is not installed. MCP servers will be bypassed. "
            "To enable, run: pip install 'crewai-tools[mcp]' mcp"
        )
        return []

    tools = []

    # 1. Load Shodan MCP Server if API Key exists
    shodan_key = os.environ.get("SHODAN_API_KEY", "")
    if shodan_key:
        try:
            # Configure Shodan server parameters (runs via npx)
            shodan_params = StdioServerParameters(
                command="npx",
                args=["-y", "@modelcontextprotocol/server-shodan"],
                env={"SHODAN_API_KEY": shodan_key, "PATH": os.environ.get("PATH", "")}
            )
            # Create adapter and get tools
            shodan_adapter = MCPServerAdapter(shodan_params)
            # Extract tools (MCPServerAdapter can be used directly or as a list)
            tools.extend(shodan_adapter.to_tools())
            logger.info("Successfully loaded Shodan MCP tools.")
        except Exception as e:
            logger.error(f"Failed to load Shodan MCP Server: {str(e)}")

    # 2. Load VirusTotal MCP Server if API Key exists
    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "")
    if vt_key:
        try:
            # Configure VirusTotal server parameters
            vt_params = StdioServerParameters(
                command="npx",
                args=["-y", "@modelcontextprotocol/server-virustotal"],
                env={"VIRUSTOTAL_API_KEY": vt_key, "PATH": os.environ.get("PATH", "")}
            )
            vt_adapter = MCPServerAdapter(vt_params)
            tools.extend(vt_adapter.to_tools())
            logger.info("Successfully loaded VirusTotal MCP tools.")
        except Exception as e:
            logger.error(f"Failed to load VirusTotal MCP Server: {str(e)}")

    return tools


def get_mcp_status_html() -> str:
    """
    Returns an HTML status indicator for the Streamlit sidebar.
    """
    if not HAS_MCP:
        return (
            '<div class="metric-card">'
            '<div class="label">🔌 MCP Protocol</div>'
            '<div class="value" style="font-size: 0.85rem; color: #64748b;">Not Installed</div>'
            '<div class="delta" style="color: #64748b; font-size: 0.72rem;">'
            "Run: pip install 'crewai-tools[mcp]'"
            "</div>"
            "</div>"
        )

    shodan_active = bool(os.environ.get("SHODAN_API_KEY"))
    vt_active = bool(os.environ.get("VIRUSTOTAL_API_KEY"))

    status_lines = []
    if shodan_active:
        status_lines.append("● Shodan (Online)")
    else:
        status_lines.append("○ Shodan (Missing Key)")

    if vt_active:
        status_lines.append("● VirusTotal (Online)")
    else:
        status_lines.append("○ VirusTotal (Missing Key)")

    status_text = "<br>".join(status_lines)
    color = "#10b981" if (shodan_active or vt_active) else "#eab308"

    return f"""
    <div class="metric-card">
        <div class="label">🔌 MCP Protocol</div>
        <div class="value" style="font-size: 0.85rem; color: {color};">Installed</div>
        <div class="delta" style="color: #94a3b8; font-size: 0.72rem; line-height: 1.3;">
            {status_text}
        </div>
    </div>
    """
