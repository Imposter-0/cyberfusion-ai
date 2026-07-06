# Architecture Diagram

This diagram illustrates the high-level system architecture of the CyberFusion AI SOC platform, showing the data flow from the React frontend, through the FastAPI backend gateway, to the CrewAI orchestration layer.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Presentation Layer - React]
        UI[React UI Dashboard]
        CDN[CDN Hosted Assets]
        Tailwind[Tailwind CSS]
        UI --> CDN
        UI --> Tailwind
    end

    %% Backend Layer
    subgraph Backend [Backend API - FastAPI]
        API[FastAPI Server]
        Auth[API Key Validation]
        RateLimit[SlowAPI Rate Limiter]
        Security[Input Validator / SSRF Protection]
        
        API --> Auth
        API --> RateLimit
        API --> Security
    end

    %% Orchestration Layer
    subgraph Orchestration [Orchestration Layer - CrewAI]
        Coord[Coordinator Agent]
        Squad[CrewAI Multi-Agent Squad]
        Coord --> Squad
    end

    %% Data Layer
    subgraph Persistence [Data Layer - SQLite]
        DB[(investigations.db)]
    end

    %% External Services
    subgraph External [External APIs / MCPs]
        LLM[OpenAI GPT-4o-mini]
        Shodan[Shodan API]
        VT[VirusTotal API]
    end

    %% Connections
    UI -- "REST / POST /api/investigate" --> API
    Security -- "Valid Data" --> Coord
    Squad -- "Orchestrated Workflow" --> LLM
    Squad -- "Queries" --> Shodan
    Squad -- "Queries" --> VT
    Squad -- "Read / Write" --> DB
    Coord -- "Markdown Report" --> API
    API -- "JSON Response" --> UI

    classDef react fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef fastapi fill:#059669,stroke:#333,stroke-width:2px,color:#fff;
    classDef crewai fill:#ea580c,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#3b82f6,stroke:#333,stroke-width:2px,color:#fff;
    classDef ext fill:#475569,stroke:#333,stroke-width:2px,color:#fff;

    class UI react;
    class API,Auth,RateLimit,Security fastapi;
    class Coord,Squad crewai;
    class DB db;
    class LLM,Shodan,VT ext;
```
