import os
import requests
from openai import OpenAI

def transform_report(original_report: str, report_type: str, api_key: str = None) -> str:
    """
    Transforms the technical markdown report into the requested format.
    """
    if report_type == "technical":
        return original_report
        
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = api_key or os.environ.get("OPENAI_API_KEY")
    
    if not gemini_key and not openai_key:
        raise ValueError("Either GEMINI_API_KEY or OPENAI_API_KEY is required for report transformation.")
        
    prompts = {
        "executive": "Rewrite the following cybersecurity investigation report into an Executive Summary. Focus on high-level business impact, plain-English explanations of the threats, and strategic mitigation recommendations without overly technical jargon. Maintain a professional, board-ready tone. Output strictly in Markdown format.",
        "compliance": "Rewrite the following cybersecurity investigation report focusing on Compliance and Regulatory impact. Map the findings to frameworks like SOC 2, ISO 27001, HIPAA, and GDPR if applicable. Highlight which controls might be failing and what needs to be documented for auditors. Output strictly in Markdown format.",
        "risk": "Rewrite the following cybersecurity investigation report into a Quantitative Risk Summary. Focus on CVSS scores, probability vs impact matrix, severity ratings, and prioritized technical remediation steps. Format with clear headings and bullet points. Output strictly in Markdown format."
    }
    
    system_prompt = prompts.get(report_type)
    if not system_prompt:
        raise ValueError(f"Invalid report type: {report_type}")
        
    # Prefer Gemini API
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{
                    "parts": [
                        {"text": f"{system_prompt}\n\nHere is the raw technical report:\n\n{original_report}"}
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.3
                }
            }
            res = requests.post(url, json=payload, timeout=20)
            if res.status_code == 200:
                return res.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                print(f"Gemini transformation failed ({res.status_code}): {res.text}. Trying OpenAI fallback if available.")
        except Exception as e:
            print(f"Gemini transformation exception: {str(e)}. Trying OpenAI fallback if available.")

    # Fallback to OpenAI
    if openai_key:
        try:
            client = OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Here is the raw technical report:\n\n{original_report}"}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in OpenAI report transformation: {str(e)}")

    # Fallback to returning original report with a note
    return f"> **Note:** Failed to transform report to {report_type} format. Displaying original technical report below.\n\n" + original_report
