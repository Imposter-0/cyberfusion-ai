# CyberFusion AI Setup Guide

This guide provides step-by-step instructions for judges, evaluators, and developers to install and run the CyberFusion AI platform locally.

## Prerequisites

- **Python 3.10+**
- **Git**
- An **OpenAI API Key** (for CrewAI orchestration)
- (Optional) **Shodan API Key**
- (Optional) **VirusTotal API Key**

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/cyberfusion-ai.git
cd cyberfusion-ai
```

## Step 2: Set up a Virtual Environment

It is recommended to use a virtual environment to manage dependencies securely.

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

*(This installs FastAPI, Uvicorn, CrewAI, Langchain, markdown2, pdfkit, slowapi, and other backend necessities).*

## Step 4: Environment Variables (Optional)

You can supply your API keys directly via the React UI settings panel once the app is running, or you can create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
SHODAN_API_KEY=xxxxxxxxxxxxxxxxxxxx
VIRUSTOTAL_API_KEY=xxxxxxxxxxxxxxxxxxxx
```

## Step 5: Start the Platform

Run the FastAPI server. The React frontend is served statically by the backend.

```bash
python api/main.py
```

You should see output indicating that Uvicorn is running:
`INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)`

## Step 6: Access the Dashboard

Open your web browser and navigate to:
**[http://localhost:8000](http://localhost:8000)**

1. Wait for the initial boot animation to complete.
2. If you didn't set up a `.env` file, click the **Settings (gear icon)** in the top right to enter your OpenAI API key.
3. Navigate to the **Investigate** tab and launch your first threat analysis!

## Troubleshooting

- **PDF Generation Fails**: If you attempt to download a report as a PDF and receive a `wkhtmltopdf` error, ensure you have the `wkhtmltopdf` binary installed on your OS and available in your system PATH.
- **Agent Execution Timeout**: If the simulation hangs, verify that your OpenAI API key has sufficient credits and is correctly formatted.
