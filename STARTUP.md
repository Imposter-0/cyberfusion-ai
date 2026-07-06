# 🚀 Quick Start / Boot Sequence

This is the fastest way to get **CyberFusion AI** running if you already have your Python environment configured. If you are setting up the environment for the first time, please read [README_SETUP.md](README_SETUP.md) instead.

## 1. Start the Orchestration Server

Open a terminal at the root of the project and start the FastAPI server.

```powershell
python api/main.py
```

*Note: This will automatically launch Uvicorn on `0.0.0.0:8000` and mount the React frontend.*

## 2. Access the Platform

Open your web browser and navigate to:

> **[http://localhost:8000](http://localhost:8000)**

## 3. Configure AI Access

If you haven't already provided your API keys in the `.env` file, the platform will prompt you to enter an **OpenAI API Key** in the top-right Settings menu of the web interface. 

The SOC Multi-Agent Pipeline requires this key to function.
