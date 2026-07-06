# Future Scope & Roadmap

While CyberFusion AI is a highly capable prototype, there are several key areas targeted for future development to make the platform ready for massive-scale enterprise deployment.

## 1. Active Remediation Execution
Currently, the platform operates in a "read-only / analyze" mode. The agents recommend mitigation steps but do not execute them. 
**Future**: Introduce a `Remediation Agent` with MCP tools to push rules directly to firewalls, AWS IAM policies, or endpoint detection systems (EDR) pending human-in-the-loop (HITL) approval.

## 2. Native SIEM Integration
The current prototype requires users to paste logs into the dashboard manually.
**Future**: Build native polling connectors for Splunk, ElasticSearch, and Datadog to ingest alerts automatically and trigger the CrewAI pipeline without human intervention.

## 3. Local LLM Support (Air-Gapped Privacy)
We currently utilize OpenAI's `gpt-4o-mini` for fast orchestration. However, enterprise SOCs often require strict data privacy.
**Future**: Swap the Langchain LLM backend to support Ollama or vLLM, allowing the platform to run entirely locally using open-source models like Llama-3 (70B) or Mistral.

## 4. Multi-Modal Analysis
**Future**: Enable the Log Agent to process PCAP files (packet captures) directly using tools like `tshark` under the hood, and allow analysts to upload screenshot images of phishing emails for the Recon Agent to analyze using GPT-4o Vision.

## 5. Automated PDF Report Emailing
**Future**: Integrate an SMTP/SendGrid tool so the Report Agent can automatically email the final PDF to stakeholders (CISO, DevOps leads) based on the calculated severity of the threat.
