# Building AppsOps: An Azure App Services Incident Response Skill with GitHub Copilot CLI and Azure MCP

##### *How I built AppsOps by combining the Copilot extensibility stack to turn natural language into Azure PaaS operational intelligence*

---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Quick Setup](#quick-setup)
   - [Prompts Used to Create AppsOps](#prompts-used-to-create-appsops)
2. [Introduction](#introduction)
3. [The Problem with PaaS Troubleshooting](#the-problem-with-paas-troubleshooting)
4. [Layer 1: GitHub Copilot SDK (The Extensibility Foundation)](#layer-1-github-copilot-sdk--the-extensibility-foundation)
5. [Layer 2: GitHub Copilot CLI (The User Interface)](#layer-2-github-copilot-cli--the-user-interface)
6. [Layer 3: Azure MCP Server](#layer-3-azure-mcp-server)
7. [Bringing It Together: AppsOps Skill](#bringing-it-together-appsops-skill)
8. [Key Features Deep Dive](#key-features-deep-dive)
9. [Real-World Incident Response](#real-world-incident-response)
10. [Lessons Learned](#lessons-learned)
11. [Conclusion](#conclusion)
12. [Resources](#resources)

---

## Getting Started

### Prerequisites

1. **GitHub Copilot CLI** - Install from GitHub
2. **Azure CLI** - Authenticated (`az login`)
3. **Azure MCP Server** - Downloaded and configured
4. **AppsOps Skill** - Installed in skills directory

### Quick Setup

```bash
# 1. Install Azure MCP (via VS Code extension or manually)
# See: https://github.com/microsoft/mcp

# 2. Configure MCP (add to ~/.copilot/mcp-config.json)
{
  "mcpServers": {
    "azure-mcp": {
      "type": "stdio",
      "command": "path/to/azure-mcp",
      "args": ["--transport", "stdio"],
      "tools": ["*"]
    }
  }
}

# 3. Install AppsOps skill
mkdir -p ~/.copilot/skills/AppsOps
# Copy SKILL.md from repo

# 4. Reload and test
/skills reload
/apps status
```

### Prompts Used to Create AppsOps

The following prompts were used iteratively in GitHub Copilot CLI to build the AppsOps skill. You can use these same prompts to recreate or customize the skill for your environment.

#### Prompt 1: Initial Skill Creation

```
Create an AppsOps skill using Azure MCP for Azure App Services (Web Apps and 
Function Apps), App Service Plans. This should perform similar to K8sOps - 
quick health checks, deep diagnosis, log aggregation, and support case generation.
```

#### Prompt 2: Adding Response Behavior

```
Modify the skill to use the same "Green Light / Red Light" response model as K8sOps.
When everything is healthy, just say "All systems green". When issues are found,
provide WHAT (resource and state), WHY (root cause with evidence), FIX (exact command).
```

#### Prompt 3: Integrating App Insights

```
Add the ability to query Application Insights for request telemetry and exceptions.
Correlate App Insights data with Azure Monitor metrics for a complete picture.
```

#### Prompt 4: Adding Log Aggregation

```
Add log aggregation that pulls from multiple sources: app logs, platform logs,
deployment history, metrics, and App Insights. Correlate by timestamp into
a unified timeline.
```

#### Prompt 5: Support Case Template

```
Create an attribute that generates a support case template containing: Title,
Description, Problem start time, subscription id, resource URI, app configuration,
initial triage outcomes, suggested root cause. Include all relevant Azure context.
```

---

## Introduction

After building [K8sOps](../K8sOps/) for Azure Kubernetes Service, I realized the same patterns could transform how we troubleshoot Azure PaaS services. Web Apps and Function Apps power millions of applications, yet incident response still involves jumping between the Azure Portal, CLI, Application Insights, and Log Analytics.

What if you could simply ask: *"What's wrong with my app?"* and get an intelligent, correlated response with actionable remediation?

**AppsOps** brings the same AI-powered incident response to Azure App Services:

- **Azure App Service** (Web Apps)
- **Azure Functions** (Function Apps)
- **App Service Plans**

Built on the same stack as K8sOps:
- **GitHub Copilot SDK** - The extensibility foundation
- **GitHub Copilot CLI** - The terminal interface
- **Azure MCP Server** - The bridge to Azure APIs

---

## The Problem with PaaS Troubleshooting

PaaS is supposed to be simpler than IaaS. No VMs to manage. No OS patches. Just deploy and run.

But when things go wrong, the abstraction becomes a barrier:

| Challenge | Reality |
|-----------|---------|
| **Scattered Data** | Logs in App Service, metrics in Azure Monitor, traces in App Insights |
| **Hidden Infrastructure** | Can't SSH into the underlying VM to check disk space |
| **Multiple SKUs** | Different behaviors for Consumption, Premium, Dedicated plans |
| **Deployment Complexity** | Slots, swap operations, deployment sources, CI/CD pipelines |
| **Networking Maze** | VNet integration, private endpoints, hybrid connections |

A typical troubleshooting session:

```
1. Check Azure Portal → App is "Running" (but returning 500s)
2. Open App Insights → See exceptions, but where's the root cause?
3. Check metrics → CPU is fine, memory is fine
4. Look at logs → Which logs? App logs? Platform logs? HTTP logs?
5. Check recent deployments → Was something deployed?
6. Review app settings → Did someone change a connection string?
7. Check the App Service Plan → Is it scaled correctly?
8. Examine networking → Is VNet integration working?
```

**30+ minutes later**, you might find the issue.

AppsOps reduces this to **one command**.

---

## Layer 1: GitHub Copilot SDK (The Extensibility Foundation)

### What is the GitHub Copilot SDK?

The GitHub Copilot SDK provides the programmatic foundation for extending Copilot's capabilities:

- **Extension APIs** - Build custom Copilot extensions
- **Model Context Protocol (MCP)** - Standardized AI-to-external-system communication
- **Skill Definitions** - Declarative format for encoding domain expertise
- **Tool Invocation** - Execute tools and interpret results

### Why It Matters for AppsOps

The SDK enables AppsOps to:

1. **Load the skill definition** from SKILL.md
2. **Connect to Azure MCP Server** for API access
3. **Chain multiple tool calls** (list apps → get metrics → query App Insights)
4. **Format responses** according to the skill's rules

---

## Layer 2: GitHub Copilot CLI (The User Interface)

### The CLI as Skill Runtime

GitHub Copilot CLI provides the terminal interface that executes skills:

```
User Input          CLI Processing           Skill Execution
───────────        ────────────────         ────────────────
           
/apps status  ──->  Match to AppsOps   ──->  Read SKILL.md
                   skill                    Parse commands
                                            Invoke Azure CLI
                                            Query App Insights
                                            Format response
                                                 │
                                                 v
                                           Return to user
```

### Skills Directory Structure

```
~/.copilot/
├── mcp-config.json          # MCP server configuration
└── skills/
    └── AppsOps/
        ├── SKILL.md         # Skill definition
        ├── VERSION          # Version tracking
        ├── ARCHITECTURE.md  # Documentation
        └── DEMO-RUNBOOK.md  # Usage examples
```

---

## Layer 3: Azure MCP Server

### What is Azure MCP?

The [Azure MCP Server](https://github.com/microsoft/mcp) implements the Model Context Protocol for Azure services. Unlike AKS MCP (which is Kubernetes-specific), Azure MCP provides access to **all Azure services** through the Azure CLI.

### Key Capabilities for AppsOps

| Operation | Azure CLI Command |
|-----------|-------------------|
| List Web Apps | `az webapp list` |
| List Function Apps | `az functionapp list` |
| App details | `az webapp show` |
| App Service Plan | `az appservice plan show` |
| App settings | `az webapp config appsettings list` |
| Metrics | `az monitor metrics list` |
| Activity log | `az monitor activity-log list` |
| App Insights | `az monitor app-insights query` |
| Restart | `az webapp restart` |
| Scale | `az webapp scale` |

### Configuring Azure MCP

Add to `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "azure-mcp": {
      "type": "stdio",
      "command": "path/to/azure-mcp",
      "args": ["--transport", "stdio"],
      "tools": ["*"]
    }
  }
}
```

---

## Bringing It Together: AppsOps Skill

### The Complete Stack

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
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │ az webapp   │  │az functionapp│  │ az monitor │  │az appservice│    │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└──────────┼────────────────┼────────────────┼────────────────┼───────────┘
           │                │                │                │
           v                v                v                v
    ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ Azure ARM  │   │  Functions │   │App Insights│   │   Metrics  │
    │    API     │   │    API     │   │    API     │   │    API     │
    └────────────┘   └────────────┘   └────────────┘   └────────────┘
```

### Design Philosophy

AppsOps follows the same principles as K8sOps:

1. **Green Light / Red Light** - Don't overwhelm with data when healthy
2. **Root Cause First** - Lead with "why" not just "what"
3. **Actionable Output** - Every issue includes a fix command

### Response Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALL HEALTHY                                  │
│                                                                 │
│  ✅ All systems green | 5 Web Apps | 3 Function Apps | No issues│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ISSUES DETECTED                               │
│                                                                 │
│  🚨 ISSUE: Health Check Failing - HTTP 503 Errors              │
│                                                                 │
│  WHAT: app-y7njcffivri2q /health returning 503 (60 errors/hr)  │
│  WHY:  SQL Server connection denied - VNet not whitelisted     │
│  FIX:  az sql server vnet-rule create --server <sql> ...       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Commands

| Command | Purpose |
|---------|---------|
| `/apps status` | Quick health check all apps |
| `/apps diagnose [app]` | Deep root cause analysis |
| `/apps logs <app>` | App logs with error analysis |
| `/apps logs --aggregate` | Correlated timeline from all sources |
| `/apps logs --export` | ZIP archive for support |
| `/apps case [app]` | Generate support case template |
| `/apps restart <app>` | Restart application |
| `/apps scale <app> --instances N` | Scale out/in |

---

## Key Features Deep Dive

### 1. Multi-Source Log Aggregation

The `/apps logs --aggregate` command pulls from multiple Azure sources and correlates by timestamp:

```
📊 LOG AGGREGATION: myapp-prod (last 1h)

SOURCES:
- Application Logs (stdout/stderr)
- Platform Logs (HTTP/IIS)
- Deployment History
- Azure Monitor Metrics
- Application Insights

TIMELINE:
─────────────────────────────────────────────────────────────
14:25:00 [DEPLOY]    Deployment started by deploy@contoso.com
14:25:45 [DEPLOY]    Deployment completed (build: abc123)
14:25:50 [PLATFORM]  Application pool recycled
14:26:00 [APP]       Application started successfully
14:30:15 [APP]       SqlException: Connection timeout
14:30:16 [METRIC]    HTTP 5xx count: 12 (was 0)
─────────────────────────────────────────────────────────────

🔴 ROOT CAUSE: Deployment at 14:25 introduced connection issue
```

### 2. Application Insights Integration

AppsOps queries App Insights for deep application telemetry:

```
REQUEST SUMMARY (last 1h):
| Status Code | Count | Percentage |
|-------------|-------|------------|
| 200         | 1,247 | 85%        |
| 503         | 186   | 13%        |
| 500         | 32    | 2%         |

TOP EXCEPTIONS:
| Type                    | Count | Message                           |
|-------------------------|-------|-----------------------------------|
| SqlException            | 186   | Deny Public Network Access        |
| NullReferenceException  | 32    | Object reference not set          |
```

### 3. Support Case Generation

The `/apps case` command generates a pre-filled support case:

```markdown
# Azure Support Case - App Service Incident

## Case Summary
| Field | Value |
|-------|-------|
| **Title** | Web App HTTP 503 - app-y7njcffivri2q |
| **Severity** | 🔴 Critical |
| **Problem Start Time** | 2026-01-25T02:30:00Z |

## Azure Context
| Field | Value |
|-------|-------|
| **Subscription ID** | 463a82d4-1896-4332-aeeb-618ee5a5aa93 |
| **Resource Group** | sre-demo2-rg |
| **Resource URI** | /subscriptions/.../sites/app-y7njcffivri2q |

## App Details
| Field | Value |
|-------|-------|
| **Runtime** | .NET Core 8.0 (Linux) |
| **Plan** | B1 Basic |
| **Region** | East US 2 |

## Suggested Root Cause
SQL Server has "Deny Public Network Access" enabled but App Service 
VNet is not whitelisted in SQL firewall rules.

## Evidence
- 60 x HTTP 503 on /health endpoint
- SqlException: "Connection denied because Deny Public Network Access is set to Yes"
```

### 4. Intelligent Issue Detection

AppsOps automatically checks for common issues:

| Check | Method | Action |
|-------|--------|--------|
| App stopped | `az webapp show --query state` | Alert + restart command |
| HTTP 5xx spike | Azure Monitor metrics | Diagnose + App Insights query |
| High memory | MemoryWorkingSet metric | Scale or restart command |
| Slow response | AverageResponseTime metric | Investigate + scale command |
| Failed deployment | Deployment history | Redeploy previous version |
| SQL connectivity | App Insights exceptions | Network configuration fix |

---

## Real-World Incident Response

Here's a real incident I diagnosed with AppsOps:

```bash
# 1. Quick check
/apps status
# 🚨 1 issue: app-y7njcffivri2q returning 503 errors

# 2. Deep diagnosis
/apps diagnose app-y7njcffivri2q
# Found: Health endpoint failing, SqlException on every request

# 3. Check logs
/apps logs app-y7njcffivri2q --timespan 1h
# 60 x 503 errors, all on /health
# Exception: "Deny Public Network Access is set to Yes"

# 4. Root cause identified
# SQL Server blocks VNet, app can't reach database

# 5. Fix
az sql server vnet-rule create --server <sql> -g sre-demo2-rg \
  --name allow-appservice --vnet-name vnet-y7njcffivri2q \
  --subnet snet-appservice

# 6. Verify
/apps status
# ✅ All systems green
```

**Total time: 3 minutes** (vs. 30+ minutes of portal clicking)

---

## Lessons Learned

### 1. PaaS Needs Different Metrics

Unlike AKS where you check pods and nodes, App Service metrics are different:

| AKS (K8sOps) | App Service (AppsOps) |
|--------------|----------------------|
| Pod CPU/Memory | MemoryWorkingSet |
| Node conditions | App state |
| CrashLoopBackOff | HTTP 5xx errors |
| ImagePullBackOff | Deployment failures |
| kubectl logs | App Insights queries |

### 2. App Insights is Essential

For App Service, Application Insights provides the deep telemetry that kubectl logs provides for Kubernetes. Without it, you're blind to application-level issues.

### 3. Networking is the #1 Issue

Most App Service problems I've seen are networking-related:
- VNet integration misconfigured
- Private endpoints missing
- SQL firewall rules incorrect
- Key Vault access denied

AppsOps surfaces these quickly by correlating exceptions with network configuration.

### 4. The Same Pattern Works

The "Green Light / Red Light" + "WHAT / WHY / FIX" pattern from K8sOps translates perfectly to PaaS. Operators want signal, not data dumps.

---

## Conclusion

AppsOps demonstrates that the GitHub Copilot extensibility stack works across Azure services:

| Component | K8sOps | AppsOps |
|-----------|--------|---------|
| **MCP Server** | AKS MCP | Azure MCP |
| **Target** | Kubernetes clusters | App Services |
| **Commands** | `/k8s` | `/apps` |
| **Logs** | kubectl + Log Analytics | App Insights + Platform |
| **Pattern** | Green/Red + WHAT/WHY/FIX | Same |

The skill is open source:
**https://github.com/jvargh/ghcp-stuff/tree/main/AppsOps**

---

## What's Next?

The same pattern can extend to other Azure services:

- **DataOps** - Azure SQL, Cosmos DB, Storage
- **NetOps** - VNets, NSGs, Load Balancers, Front Door
- **SecOps** - Key Vault, Defender, Sentinel

The terminal is becoming the unified interface for cloud operations.

---

## Resources

- [Azure MCP Server](https://github.com/microsoft/mcp)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Azure App Service Documentation](https://learn.microsoft.com/azure/app-service/)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [K8sOps Skill](https://github.com/jvargh/ghcp-stuff/tree/main/K8sOps) - The AKS equivalent

---

*AppsOps v1.0.0 | Built with GitHub Copilot CLI + Azure MCP*
