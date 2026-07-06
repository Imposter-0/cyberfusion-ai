"""
Custom web scraping tool for CyberFusion AI.
Fetches a URL and returns security-relevant information:
HTTP headers, security headers analysis, page metadata, and linked resources.
"""

from typing import ClassVar, Type
import socket
import ipaddress
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

def is_safe_url(url: str) -> bool:
    """Validates that a URL does not point to internal/private infrastructure (SSRF protection)."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False
            
        if hostname.lower() in ['localhost', '0.0.0.0', '127.0.0.1', '::1', 'metadata.google.internal', '169.254.169.254']:
            return False
            
        try:
            ip = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip)
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
                return False
        except socket.gaierror:
            pass
            
        return True
    except Exception:
        return False


class WebScraperInput(BaseModel):
    """Input schema for the WebScraperTool."""

    url: str = Field(
        ..., description="The full URL to analyze (e.g. https://example.com)"
    )


class WebScraperTool(BaseTool):
    """
    Fetches a website and returns security-relevant information including
    HTTP response headers, security headers analysis, page metadata,
    and a summary of linked resources.
    """

    name: str = "Website Security Scanner"
    description: str = (
        "Fetches a website URL and returns security-relevant information: "
        "HTTP headers, security headers analysis (CSP, HSTS, X-Frame-Options, etc.), "
        "SSL/TLS info, page title, meta tags, and linked scripts/stylesheets. "
        "Use this to analyze the security posture of a website."
    )
    args_schema: Type[BaseModel] = WebScraperInput

    # Important security headers to check
    SECURITY_HEADERS: ClassVar[list[str]] = [
        "Strict-Transport-Security",
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Referrer-Policy",
        "Permissions-Policy",
        "Cross-Origin-Opener-Policy",
        "Cross-Origin-Resource-Policy",
        "Cross-Origin-Embedder-Policy",
    ]

    def _run(self, url: str) -> str:
        """Execute the web scraping and security analysis."""
        # Normalize URL
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        if not is_safe_url(url):
            return self._format_error(url, "SECURITY POLICY BLOCKED: Access to internal or private IP ranges is prohibited (SSRF Protection).")

        try:
            response = requests.get(
                url,
                timeout=15,
                headers={
                    "User-Agent": "CyberFusion-AI Security Scanner/1.0"
                },
                allow_redirects=True,
                verify=True,
            )
        except requests.exceptions.SSLError:
            return self._format_error(url, "SSL/TLS ERROR: Certificate verification failed. The site may have an invalid, expired, or self-signed certificate.")
        except requests.exceptions.ConnectionError:
            return self._format_error(url, "CONNECTION ERROR: Could not connect to the server. The domain may not exist or the server is down.")
        except requests.exceptions.Timeout:
            return self._format_error(url, "TIMEOUT: The server did not respond within 15 seconds.")
        except requests.exceptions.RequestException as e:
            return self._format_error(url, f"REQUEST ERROR: {str(e)}")

        sections = []

        # --- Basic Response Info ---
        sections.append("## BASIC RESPONSE INFO")
        sections.append(f"- URL: {response.url}")
        sections.append(f"- Final URL (after redirects): {response.url}")
        sections.append(f"- Status Code: {response.status_code}")
        sections.append(f"- Redirects: {len(response.history)} hop(s)")
        if response.history:
            chain = " → ".join(str(r.status_code) + " " + r.url for r in response.history)
            sections.append(f"- Redirect Chain: {chain}")
        sections.append(f"- Response Time: {response.elapsed.total_seconds():.2f}s")
        sections.append(f"- Content-Type: {response.headers.get('Content-Type', 'Not specified')}")
        sections.append(f"- Server: {response.headers.get('Server', 'Not disclosed')}")

        # --- SSL/TLS ---
        sections.append("\n## SSL/TLS ANALYSIS")
        if response.url.startswith("https://"):
            sections.append("- HTTPS: ✅ YES")
            sections.append("- Certificate: Valid (connection succeeded)")
        else:
            sections.append("- HTTPS: ❌ NO — site is served over plain HTTP")
            sections.append("- WARNING: All traffic is unencrypted")

        # --- Security Headers ---
        sections.append("\n## SECURITY HEADERS ANALYSIS")
        present = 0
        for header in self.SECURITY_HEADERS:
            value = response.headers.get(header)
            if value:
                sections.append(f"- ✅ {header}: {value}")
                present += 1
            else:
                sections.append(f"- ❌ {header}: MISSING")

        score = int((present / len(self.SECURITY_HEADERS)) * 100)
        sections.append(f"\nSecurity Headers Score: {score}% ({present}/{len(self.SECURITY_HEADERS)} present)")

        # --- All Response Headers ---
        sections.append("\n## ALL RESPONSE HEADERS")
        for key, value in response.headers.items():
            sections.append(f"- {key}: {value}")

        # --- Page Metadata ---
        try:
            soup = BeautifulSoup(response.text, "html.parser")

            sections.append("\n## PAGE METADATA")
            title = soup.title.string.strip() if soup.title and soup.title.string else "No title"
            sections.append(f"- Title: {title}")

            for meta in soup.find_all("meta"):
                name = meta.get("name", meta.get("property", ""))
                content = meta.get("content", "")
                if name and content:
                    sections.append(f"- Meta [{name}]: {content[:200]}")

            # --- External Resources ---
            sections.append("\n## EXTERNAL RESOURCES")
            scripts = soup.find_all("script", src=True)
            sections.append(f"- External Scripts: {len(scripts)}")
            for s in scripts[:15]:
                sections.append(f"  - {s['src']}")

            links = soup.find_all("link", rel="stylesheet")
            sections.append(f"- External Stylesheets: {len(links)}")
            for lnk in links[:10]:
                href = lnk.get("href", "")
                sections.append(f"  - {href}")

            # --- Forms ---
            forms = soup.find_all("form")
            if forms:
                sections.append(f"\n## FORMS DETECTED: {len(forms)}")
                for i, form in enumerate(forms[:5], 1):
                    action = form.get("action", "No action")
                    method = form.get("method", "GET").upper()
                    sections.append(f"- Form {i}: method={method}, action={action}")
                    inputs = form.find_all("input")
                    for inp in inputs:
                        inp_type = inp.get("type", "text")
                        inp_name = inp.get("name", "unnamed")
                        sections.append(f"  - Input: name={inp_name}, type={inp_type}")

        except Exception as e:
            sections.append(f"\n## PAGE PARSING ERROR: {str(e)}")

        return "\n".join(sections)

    def _format_error(self, url: str, error_msg: str) -> str:
        """Format an error response."""
        return (
            f"## SCAN RESULT FOR: {url}\n\n"
            f"⚠️ {error_msg}\n\n"
            "This finding itself is security-relevant and should be included in the analysis."
        )
