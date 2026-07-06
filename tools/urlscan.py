import os
import time
import requests
from crewai.tools import BaseTool

class UrlscanTool(BaseTool):
    name: str = "Urlscan_Web_Sandbox"
    description: str = (
        "Useful for safely scanning and analyzing a suspicious website URL. "
        "It opens the website in a sandbox, checks network connections, and returns threat flags and a screenshot link. "
        "Input should be a fully qualified URL (e.g., 'https://example.com/login')."
    )

    def _run(self, url: str) -> str:
        api_key = os.environ.get("URLSCAN_API_KEY")
        if not api_key:
            return "Error: URLSCAN_API_KEY environment variable is not set. Cannot run web sandbox scan."

        submit_url = "https://urlscan.io/api/v1/scan/"
        headers = {
            "API-Key": api_key,
            "Content-Type": "application/json"
        }
        data = {
            "url": url,
            "visibility": "public"
        }

        try:
            # 1. Submit scan request
            response = requests.post(submit_url, headers=headers, json=data, timeout=10)
            if response.status_code != 200:
                return f"Failed to submit URL to urlscan.io: {response.status_code} - {response.text}"

            result_data = response.json()
            uuid = result_data.get("uuid")
            scan_api_url = result_data.get("api")
            
            # 2. Poll for results (up to 30 seconds)
            poll_url = f"https://urlscan.io/api/v1/result/{uuid}/"
            print(f"Submitted scan. UUID: {uuid}. Polling for results...")
            
            for attempt in range(6):
                time.sleep(5)
                poll_resp = requests.get(poll_url, timeout=10)
                if poll_resp.status_code == 200:
                    data = poll_resp.json()
                    verdicts = data.get("verdicts", {})
                    overall_score = verdicts.get("overall", {}).get("score", 0)
                    malicious = verdicts.get("overall", {}).get("malicious", False)
                    
                    screenshot_url = f"https://urlscan.io/screenshots/{uuid}.png"
                    
                    summary = (
                        f"Urlscan.io Sandbox Scan Complete for {url}:\n"
                        f"- Verdict: {'MALICIOUS' if malicious else 'Clean/Unverified'}\n"
                        f"- Threat Score: {overall_score}/100\n"
                        f"- Screenshot Evidence: {screenshot_url}\n"
                        f"- Domain: {data.get('page', {}).get('domain')}\n"
                        f"- IP Address: {data.get('page', {}).get('ip')}\n"
                        f"- Country: {data.get('page', {}).get('country')}\n"
                        f"- Server: {data.get('page', {}).get('server')}\n"
                    )
                    return summary
                elif poll_resp.status_code == 404:
                    # Not ready yet, keep polling
                    continue
                else:
                    return f"Error polling urlscan.io result: {poll_resp.status_code}"
            
            return (
                f"Scan submitted successfully to urlscan.io, but the report is taking too long to generate.\n"
                f"You can view the progress manually here: https://urlscan.io/result/{uuid}/"
            )

        except Exception as e:
            return f"Failed to query urlscan.io: {str(e)}"
