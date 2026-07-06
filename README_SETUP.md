# ⚙️ Setup and Configuration Guide

This guide will walk you through setting up the **CyberFusion AI** development environment from scratch.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.10+** (Required for modern FastAPI & CrewAI compatibility)
- **Git**

---

## 2. Environment Setup

It is highly recommended to isolate the project's dependencies using a virtual environment.

### Clone the Repository
```bash
git clone https://github.com/Imposter-0/cyberfusion-ai.git
cd cyberfusion-ai
```

### Create the Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac / Linux
python -m venv venv
source venv/bin/activate
```

### Install Dependencies
With your virtual environment active, install the required packages:
```bash
pip install -r requirements.txt
```
*(This installs FastAPI, Uvicorn, CrewAI, Langchain, and other required libraries.)*

---

## 3. Configuration (.env)

The platform requires API keys to interact with language models and threat intelligence services.
You must configure the `.env` file at the root of the project.

### Create the `.env` file
If you haven't already, copy the provided example or create a new `.env` file in the root directory:

```env
# Required: OpenAI API Key for the CrewAI Orchestrator
OPENAI_API_KEY=sk-proj-xxxxxxx

# Optional: For the VirusTotal MCP Server
VIRUSTOTAL_API_KEY=xxxxxxx

# Optional: For the Shodan MCP Server
SHODAN_API_KEY=xxxxxxx
```
*Note: If you do not provide an OpenAI key in the `.env` file, the UI will prompt you to enter it in the browser.*

---

## 4. Run the Server

Once configured, you can launch the platform. 

```bash
# Ensure you are in the project root
python api/main.py
```

Access the UI at: **[http://localhost:8000](http://localhost:8000)**

> For rapid subsequent launches, you can refer to [STARTUP.md](STARTUP.md).
