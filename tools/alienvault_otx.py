import os
import requests
from crewai.tools import BaseTool

class AlienVaultOTXTool(BaseTool):
    name: str = "AlienVault_OTX_Lookup"
    description: str = (
        "Useful for checking threat intelligence on an indicator of compromise (IOC) "
        "such as an IPv4 address, domain, or file hash. "
        "Input should be a string containing the IOC (e.g., '8.8.8.8' or 'evil-domain.com')."
    )

    def _run(self, ioc: str) -> str:
        api_key = os.environ.get("ALIENVAULT_OTX_KEY")
        if not api_key:
            return "Error: ALIENVAULT_OTX_KEY environment variable is not set."

        # Auto-detect IOC type
        ioc_type = "domain"
        if len(ioc.split('.')) == 4 and all(part.isdigit() for part in ioc.split('.')):
            ioc_type = "IPv4"
        elif len(ioc) in [32, 40, 64] and all(c in "0123456789abcdefABCDEF" for c in ioc):
            ioc_type = "file"

        url = f"https://otx.alienvault.com/api/v1/indicators/{ioc_type}/{ioc}/general"
        headers = {"X-OTX-API-KEY": api_key}

        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 404:
                return f"No threat intelligence found on AlienVault OTX for {ioc_type}: {ioc}."
            if response.status_code != 200:
                return f"Error from AlienVault OTX: {response.status_code} - {response.text}"

            data = response.json()
            pulse_count = data.get("pulse_info", {}).get("count", 0)
            
            if pulse_count == 0:
                return f"AlienVault OTX found the indicator '{ioc}', but it is not associated with any malicious pulses/threat campaigns."

            pulses = data.get("pulse_info", {}).get("pulses", [])
            threat_summary = f"AlienVault OTX Alert: '{ioc}' appears in {pulse_count} threat pulses.\n"
            
            for i, pulse in enumerate(pulses[:3]): # List top 3
                threat_summary += f"- Campaign: {pulse.get('name', 'Unknown')} (Tags: {', '.join(pulse.get('tags', []))})\n"
                
            if pulse_count > 3:
                threat_summary += f"... and {pulse_count - 3} more campaigns.\n"
                
            return threat_summary

        except Exception as e:
            return f"Failed to query AlienVault OTX: {str(e)}"
