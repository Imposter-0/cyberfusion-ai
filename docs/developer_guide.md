# Developer Guide

Welcome to the CyberFusion AI development documentation. This guide explains how to extend the platform, add new specialized agents, or integrate new external tools.

## Architecture Overview

CyberFusion AI is built using a modern, lightweight, and modular stack:
- **Frontend**: React (served via CDN without a bundler for rapid deployment) + TailwindCSS. Located in `static/app.jsx`.
- **Backend**: FastAPI (Python 3.10+). Located in `api/main.py`.
- **Orchestration**: CrewAI + Langchain. Located in `agents/coordinator.py`.
- **Database**: SQLite3 (Local file-based persistence). Located in `database/db.py`.

## Adding a New Agent

To introduce a new specialist to the CrewAI squad (e.g., a "Malware Reverse Engineer Agent"):

1. **Define the Agent in `agents/coordinator.py`**:
   ```python
   malware_agent = Agent(
       role='Malware Analyst',
       goal='Decompile and statically analyze provided binary hashes.',
       backstory='A seasoned reverse engineer who thrives on tearing apart malware.',
       verbose=True,
       allow_delegation=False,
       llm=llm
   )
   ```

2. **Add the Task**:
   ```python
   malware_task = Task(
       description='Analyze the following malware hash: {user_input}',
       expected_output='A detailed analysis of the malware behavior.',
       agent=malware_agent
   )
   ```

3. **Register in the Crew**:
   Add the agent and task to the `Crew` initialization block inside `trigger_investigation()`.

4. **Update Frontend UI State (Optional)**:
   Add the agent to the `SOC_AGENTS` constant array in `static/app.jsx` so the visual pipeline tracker includes it in the UI.

## Integrating a New Tool (MCP)

To add a new tool (e.g., a custom SIEM connector):

1. **Create the Tool Class in `agents/tools.py`**:
   Inherit from Langchain's `BaseTool`.
   ```python
   from langchain.tools import BaseTool

   class SplunkLookupTool(BaseTool):
       name = "splunk_lookup"
       description = "Queries Splunk for IP occurrences."

       def _run(self, query: str) -> str:
           # Implement Splunk API call here
           return "Found 15 occurrences of IP."
   ```

2. **Assign to an Agent**:
   Add `tools=[SplunkLookupTool()]` to the relevant agent instantiation in `coordinator.py`.

## Frontend Modifications

The frontend lives entirely in `static/app.jsx`. It uses React 18, Babel for in-browser JSX compilation, and Tailwind CSS.

- **State Management**: Handled via standard React hooks (`useState`, `useEffect`, `useCallback`).
- **Styling**: Tailwind utility classes + custom `@keyframes` in `static/index.html`.
- **Deployment**: No `npm run build` is required for the frontend. Saving `app.jsx` and refreshing the browser instantly applies changes.

## Best Practices
- **Security**: Never expose API keys in `app.jsx`. Always proxy third-party API calls through FastAPI.
- **Error Handling**: Use the `ToastProvider` for user-facing errors in React, and FastAPI's built-in `HTTPException` for backend errors.
