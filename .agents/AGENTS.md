# CyberFusion AI - Global Agent Rules

These rules apply universally to all tasks within this project.

## Development Rules (Step 10)
1. **Never remove existing functionality.** Ensure backwards compatibility and retain all current features.
2. **Never break backend APIs.** Maintain the existing FastAPI endpoints and their expected request/response schemas.
3. **Never reduce AI capabilities.** Ensure CrewAI agents, capabilities, prompts, and tools remain intact and powerful.
4. **Always write modular, production-quality code.** Follow software engineering best practices.
5. **Follow clean architecture.** Keep concerns separated (e.g., API layer, orchestration layer, UI layer).
6. **Use reusable components.** Avoid code duplication in the React frontend; use modular components.
7. **Keep the backend in Python.** The primary backend and orchestration must remain in Python using FastAPI and CrewAI.
8. **React/FastAPI integration.** Since the frontend is in React, the FastAPI backend must connect to it cleanly.
9. **Explain major changes.** Every major change must be explained before implementation.
10. **Prioritize maintainability & competition readiness.** Avoid shortcuts; the final result must look and feel like a commercial AI-powered SOC platform, not a prototype.
