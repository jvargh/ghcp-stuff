# AppsOps Architecture

## Overview

AppsOps is an AI-powered incident response skill for Azure App Services (Web Apps, Function Apps, App Service Plans). It provides natural language access to diagnostic and operational capabilities through the Azure MCP Server.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                       │
│                         "/apps diagnose"                                │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB COPILOT CLI                               │
│                    (Built on Copilot SDK)                               │
│                                                                         │
│   * Parses user input                                                   │
│   * Matches to AppsOps skill                                            │
│   * Loads SKILL.md definition                                           │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────┐
│                        AppsOps SKILL                                    │
│                ~/.copilot/skills/AppsOps/SKILL.md                       │
│                                                                         │
│   * Defines /apps commands                                              │
│   * Specifies response behavior (green/red model)                       │
│   * Maps operations to Azure CLI commands                               │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────┐
│                    AZURE MCP SERVER                                     │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│   │   az webapp     │  │ az functionapp  │  │ az appservice   │         │
│   │   commands      │  │ commands        │  │ plan commands   │         │
│   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│            │                    │                    │                  │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│   │  az monitor     │  │  az webapp log  │  │  az monitor     │         │
│   │  metrics        │  │  tail/download  │  │  activity-log   │         │
│   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│            │                    │                    │                  │
└────────────┼────────────────────┼────────────────────┼──────────────────┘
             │                    │                    │
             v                    v                    v
      ┌────────────┐       ┌────────────┐       ┌────────────┐
      │ Azure ARM  │       │  App Logs  │       │  Activity  │
      │    API     │       │  Storage   │       │    Log     │
      └────────────┘       └────────────┘       └────────────┘
```

## Component Details

### 1. GitHub Copilot CLI
- User interface for natural language commands
- Loads and executes skills
- Renders responses in terminal

### 2. AppsOps Skill
- Declarative SKILL.md definition
- Command mapping (/apps status, /apps diagnose, etc.)
- Response formatting rules

### 3. Azure MCP Server
- Bridges Copilot to Azure Resource Manager
- Executes Azure CLI commands
- Returns structured responses

### 4. Azure Services Accessed

| Service | Purpose |
|---------|---------|
| App Service | Web App management |
| Functions | Function App management |
| App Service Plans | Compute layer management |
| Azure Monitor | Metrics and alerts |
| Log Analytics | Centralized logging |
| Application Insights | APM data |

## Data Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. PARSE: "/apps diagnose myapp"                            │
│    - Extract command: diagnose                              │
│    - Extract target: myapp                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DISCOVER: Find app resources                             │
│    - az webapp list → find myapp                            │
│    - az webapp show → get resource group, plan              │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DIAGNOSE: Run health checks                              │
│    - Check app state (Running/Stopped)                      │
│    - Query metrics (CPU, Memory, HTTP errors)               │
│    - Check recent deployments                               │
│    - Review logs for errors                                 │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ANALYZE: Correlate findings                              │
│    - Identify root cause                                    │
│    - Determine severity                                     │
│    - Generate remediation steps                             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RESPOND: Format output                                   │
│    - If healthy: "✅ All systems green"                     │
│    - If issues: WHAT / WHY / FIX format                     │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

- **Authentication**: Uses Azure CLI credentials (`az login`)
- **Authorization**: Respects Azure RBAC on resources
- **Data Handling**: Logs stay in Azure, only summaries returned
- **Secrets**: App settings with secrets are redacted in exports

## Extensibility

The skill can be extended by:
1. Adding new commands to SKILL.md
2. Mapping to additional Azure CLI commands
3. Integrating with Application Insights queries
4. Adding custom health checks

---

*AppsOps v1.0.0*
