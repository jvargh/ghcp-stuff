# CosmosDBOps: Production Incident Response for Azure Cosmos DB

An incident response skill for Azure Cosmos DB that extends Microsoft's [cosmosdb-agent-kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit) from development-time code review to production-time operations using Azure MCP.

---

## Table of Contents

1. [Why This Skill Exists](#why-this-skill-exists)
2. [Architecture Overview](#architecture-how-the-skills-connect)
3. [Quick Start](#quick-start)
4. [Command Reference](#command-reference)
5. [How CosmosDBOps Uses cosmosdb-best-practices](#how-cosmosdbops-uses-cosmosdb-best-practices)
6. [Real Example](#real-example-full-diagnostic-run)
7. [Prompts Used to Create This Skill](#prompts-used-to-create-this-skill)
8. [Comparison: The Two Skills](#comparison-the-two-skills)
9. [Files](#files)
10. [Architecture Documentation](#architecture)
11. [Demo Runbook](#demo-runbook)
12. [Resources](#resources)
13. [References](#references)

---

## Why This Skill Exists

Microsoft's [**cosmosdb-agent-kit**](https://github.com/AzureCosmosDB/cosmosdb-agent-kit) provides 45+ best practice rules for code review, but it analyzes code files, not live Azure resources. When your database is throttling at 3 AM, you need runtime diagnostics.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  cosmosdb-best-practices               CosmosDBOps                       │
│  (Microsoft's cosmosdb-agent-kit)      (This Skill)                      │
│  ────────────────────────────          ────────────                      │
│                                                                          │
│  ✅ "Is my partition key correct?"     ✅ "Why am I getting 429s?"      │
│  ✅ "Is my query efficient?"           ✅ "Where's the hot partition?"  │
│  ✅ "Am I using the SDK right?"        ✅ "Generate a support case"     │
│                                                                          │
│  📄 Analyzes: Code files (.cs, .js)    🌐 Queries: Azure MCP → ARM APIs │
│  ⏰ When: Development                  ⏰ When: Production incidents    │
│  📍 Location: ~/.copilot/skills/       📍 Location: ~/.copilot/skills/  │
│      cosmosdb-best-practices/              CosmosDBOps/                  │
└──────────────────────────────────────────────────────────────────────────┘
```

**CosmosDBOps fills the runtime gap** by using Azure MCP to query Azure Monitor metrics, account configuration, diagnostic logs and then links issues back to the relevant `cosmosdb-best-practices` rules for code-level remediation.

---

## Architecture: How the Skills Connect

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GitHub Copilot CLI                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ~/.copilot/skills/                                                    │
│   ├── cosmosdb-best-practices/     ← Microsoft's skill (code review)    │
│   │   ├── SKILL.md                                                      │
│   │   ├── AGENTS.md                                                     │
│   │   └── rules/                   ← 45+ best practice rules            │
│   │       ├── partition-avoid-hotspots.md                               │
│   │       ├── throughput-autoscale.md                                   │
│   │       ├── global-zone-redundancy.md                                 │
│   │       └── ...                                                       │
│   │                                                                     │
│   └── CosmosDBOps/                 ← This skill (runtime ops)           │
│       └── SKILL.md                 ← References rules above             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         AZURE MCP SERVER                                │
│                    (Model Context Protocol)                             │
│                                                                         │
│   Provides live Azure data to CosmosDBOps:                              │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ az cosmosdb show           → Account config, regions, settings  │   │
│   │ az cosmosdb mongodb ...    → Databases, collections, throughput │   │
│   │ az monitor metrics list    → RU consumption, latency, 429s      │   │
│   │ az monitor activity-log    → Recent management operations       │   │
│   │ az monitor diagnostic-settings → Logging configuration          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install Prerequisites

```bash
# GitHub Copilot CLI
winget install GitHub.Copilot

# Azure CLI & authenticate
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Azure MCP should be configured in ~/.copilot/mcp-config.json
```

### 2. Install cosmosdb-best-practices (Microsoft's Code Review Skill)

```bash
npx add-skill AzureCosmosDB/cosmosdb-agent-kit

# Installs to: ~/.copilot/skills/cosmosdb-best-practices/
# Contains: 45+ rules in /rules folder
```

### 3. Install CosmosDBOps (Runtime Operations Skill)

```bash
git clone https://github.com/jvargh/ghcp-stuff.git
mkdir -p ~/.copilot/skills/CosmosDBOps
cp ghcp-stuff/CosmosDBOps/skills/* ~/.copilot/skills/CosmosDBOps/
```

### 4. Verify Both Skills

```bash
/skills reload

# Test code review (cosmosdb-best-practices)
# → Analyzes your .cs/.js files automatically

# Test runtime ops (CosmosDBOps)
/cosmosdb status
```

---

## Command Reference

### Health & Diagnostics

| Command | Description | Azure MCP Calls |
|---------|-------------|-----------------|
| `/cosmosdb status` | Quick health check | `az cosmosdb list`, `az monitor metrics` |
| `/cosmosdb diagnose <account>` | Deep root cause analysis | All APIs combined |
| `/cosmosdb metrics <account>` | RU, throttling, latency | `az monitor metrics list` |

### Partition & Throughput

| Command | Description | Azure MCP Calls |
|---------|-------------|-----------------|
| `/cosmosdb partitions <account> <db> <container>` | Hot partition detection | `az cosmosdb ... collection show` |
| `/cosmosdb throughput <account> <db> <container>` | Current settings | `az cosmosdb ... throughput show` |
| `/cosmosdb scale <account> <db> <container> --ru N` | Scale RU/s | `az cosmosdb ... throughput update` |

### Logs & Support

| Command | Description | Azure MCP Calls |
|---------|-------------|-----------------|
| `/cosmosdb logs --aggregate` | Correlated timeline | `az monitor metrics` + `activity-log` |
| `/cosmosdb logs --export` | ZIP archive | All diagnostic data |
| `/cosmosdb case <account>` | Support case template | Full diagnostic collection |

### Operations

| Command | Description | Azure MCP Calls |
|---------|-------------|-----------------|
| `/cosmosdb failover <account> --region <region>` | Manual failover | `az cosmosdb failover-priority-change` |

---

## How CosmosDBOps Uses cosmosdb-best-practices

When CosmosDBOps detects a runtime issue via Azure MCP, it references the corresponding rule from `cosmosdb-best-practices` for code-level guidance:

```
🔴 ISSUE 1: HIGH RU CONSUMPTION (100%)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ WHAT: sample-cosmos/TestDB/Orders hitting throughput ceiling           │
   │ WHY:  400 RU/s provisioned, demand exceeds capacity                    │
   │ FIX:  az cosmosdb mongodb collection throughput migrate \              │
   │         -a sample-cosmos -g sample-rg -d TestDB -n Orders \            │
   │         --throughput-type autoscale                                    │
   │                                                                        │
   │ 📚 BEST PRACTICE: throughput-autoscale                                 │
   │    See: ~/.copilot/skills/cosmosdb-best-practices/rules/               │
   │         throughput-autoscale.md                                        │
   └────────────────────────────────────────────────────────────────────────┘
```

### Issue-to-Rule Mapping

| Runtime Issue (via Azure MCP) | Best Practice Rule | Rule Location |
|-------------------------------|-------------------|---------------|
| High throttling (429s) | `monitoring-throttling` | `rules/monitoring-throttling.md` |
| Hot partition detected | `partition-avoid-hotspots` | `rules/partition-avoid-hotspots.md` |
| No zone redundancy | `global-zone-redundancy` | `rules/global-zone-redundancy.md` |
| Single region | `global-multi-region` | `rules/global-multi-region.md` |
| High latency | `sdk-connection-mode` | `rules/sdk-connection-mode.md` |
| No diagnostic settings | `monitoring-diagnostic-logs` | `rules/monitoring-diagnostic-logs.md` |
| Manual throughput maxed | `throughput-autoscale` | `rules/throughput-autoscale.md` |

---

## Real Example: Full Diagnostic Run

### Input
```
/cosmosdb case sample-cosmos
```

### Output
```
═══════════════════════════════════════════════════════════════════════════════
                    AZURE SUPPORT CASE - COSMOS DB
═══════════════════════════════════════════════════════════════════════════════

CASE SUMMARY
───────────────────────────────────────────────────────────────────────────────
Title:           Cosmos DB High RU Consumption - sample-cosmos
Severity:        🟡 Medium
Generated:       2026-01-25T23:20:15Z

ACCOUNT DETAILS (via az cosmosdb show)
───────────────────────────────────────────────────────────────────────────────
Account:         sample-cosmos (MongoDB 7.0)
Regions:         East US 2 (write), West US 2 (read)
Throughput:      400 RU/s (Manual)

PERFORMANCE METRICS (via az monitor metrics list)
───────────────────────────────────────────────────────────────────────────────
Total Requests:           10,024
Normalized RU Consumption: 100% ⚠️ MAXED
Service Availability:     100%
Server-Side Latency:      6.09 ms

ISSUES DETECTED: 3
───────────────────────────────────────────────────────────────────────────────
🔴 HIGH RU CONSUMPTION     → cosmosdb-best-practices/rules/throughput-autoscale.md
🔴 NO ZONE REDUNDANCY      → cosmosdb-best-practices/rules/global-zone-redundancy.md
🟡 PUBLIC NETWORK ACCESS   → (security hardening)

PASSING CHECKS: 10
───────────────────────────────────────────────────────────────────────────────
✅ Multi-region ✅ Auto-failover ✅ Burst capacity ✅ Diagnostics
✅ Geo-backup   ✅ TLS 1.2       ✅ 100% available ✅ Low latency

SCORE: 77% (10/13 checks passing)
═══════════════════════════════════════════════════════════════════════════════
```

---

## Prompts Used to Create This Skill

Use this prompt to generate the SKILL.md file:

```
Create a GitHub Copilot CLI skill called CosmosDBOps for Azure Cosmos DB incident response.

Requirements:
1. Use Azure MCP Server (azure-mcp) for all Azure CLI operations
2. Integrate with the existing cosmosdb-best-practices skill (at ~/.copilot/skills/cosmosdb-best-practices/) by referencing its rules when runtime issues are detected
3. Support all Cosmos DB API types: NoSQL, MongoDB, Cassandra, Gremlin, Table

Commands to implement:
- /cosmosdb status - Quick health check, returns green or identifies issues
- /cosmosdb diagnose [account] - Deep root cause analysis with WHAT/WHY/FIX format
- /cosmosdb metrics <account> - Performance metrics (RU, throttling, latency)
- /cosmosdb logs --aggregate - Correlate metrics, activity log, diagnostic logs by timestamp
- /cosmosdb logs --export - Export all diagnostic data to ZIP archive
- /cosmosdb case [account] - Generate support case template with all diagnostics pre-filled
- /cosmosdb partitions <account> <db> <container> - Partition key distribution analysis
- /cosmosdb throughput <account> <db> [container] - Show throughput settings and recommendations
- /cosmosdb scale <account> <db> <container> --ru <value> - Scale container throughput
- /cosmosdb failover <account> --region <region> - Manual failover

Response model:
- All healthy: "✅ All systems green" (one line)
- Issues found: Detailed WHAT/WHY/FIX report with reference to cosmosdb-best-practices rule

Include these sections:
- Issue-to-rule mapping table (runtime issues → cosmosdb-best-practices rules)
- Support case template fields and generation workflow
- Log export contents and workflow
- MCP tools used (Azure CLI commands for each operation)
- Automatic issue detection checks (throttling, latency, availability, partition balance, etc.)
- Best practices checks with rule references
- Full cosmosdb-best-practices rule reference table by category
```

---

## Comparison: The Two Skills

| Aspect | cosmosdb-best-practices | CosmosDBOps |
|--------|------------------------|-------------|
| **Source** | Microsoft (cosmosdb-agent-kit) | This project |
| **Focus** | Code patterns & SDK usage | Live runtime operations |
| **Input** | .cs, .js, .py, queries | Azure account name |
| **Data source** | Static file analysis | Azure MCP → ARM APIs |
| **Output** | Code suggestions | WHAT/WHY/FIX + az commands |
| **When to use** | Writing/reviewing code | Production incidents |
| **Location** | `~/.copilot/skills/cosmosdb-best-practices/` | `~/.copilot/skills/CosmosDBOps/` |

### Complete Lifecycle Coverage

```
┌────────────────────────────────────────────────────────────────────────┐
│  DEVELOPMENT                         PRODUCTION                        │
│                                                                        │
│  cosmosdb-best-practices             CosmosDBOps + Azure MCP           │
│  ─────────────────────────           ──────────────────────            │
│  Analyzes your code:                 Queries live Azure:               │
│  "Your partition key may             "Hot partition detected on        │
│   cause hot spots"                    /customerId=acme-corp"           │
│           │                                    │                       │
│           │         LINKED VIA RULES           │                       │
│           └────────────────┬───────────────────┘                       │
│                            │                                           │
│                            v                                           │
│              FIX BOTH CODE AND CONFIG                                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Files

```
~/.copilot/skills/
├── cosmosdb-best-practices/     ← Microsoft's skill
│   ├── SKILL.md
│   ├── AGENTS.md
│   └── rules/                   ← 45+ best practice rules
│       ├── partition-*.md
│       ├── throughput-*.md
│       ├── global-*.md
│       └── monitoring-*.md
│
└── CosmosDBOps/                 ← This skill
    ├── SKILL.md                 ← v1.1.0, references rules above
    └── VERSION
```

---

## Architecture

Detailed diagrams showing how CosmosDBOps uses Azure MCP to query live Azure resources and integrates with Microsoft's cosmosdb-best-practices skill.

**Covers:**
- System overview and data flow
- Azure MCP command mappings
- Integration with cosmosdb-best-practices rules
- Security model (authentication, authorization, data handling)

👉 **[View Full Architecture Documentation](ARCHITECTURE.md)**

---

## Demo Runbook

Step-by-step scenarios demonstrating all CosmosDBOps commands with real Azure MCP calls and expected outputs.

**Scenarios:**
1. Quick health check (`/cosmosdb status`)
2. Deep diagnosis (`/cosmosdb diagnose`)
3. Performance metrics (`/cosmosdb metrics`)
4. Throughput analysis (`/cosmosdb throughput`)
5. Scale throughput (`/cosmosdb scale`)
6. Generate support case (`/cosmosdb case`)
7. Export diagnostics (`/cosmosdb logs --export`)

**Also includes:** Troubleshooting guide for common issues.

👉 **[View Demo Runbook](DEMO-RUNBOOK.md)**

---

## Resources

- **cosmosdb-agent-kit** (Microsoft): https://github.com/AzureCosmosDB/cosmosdb-agent-kit
- **Azure MCP**: Model Context Protocol for Azure CLI access
- **Cosmos DB Documentation**: https://learn.microsoft.com/azure/cosmos-db
- **GitHub Copilot CLI**: https://docs.github.com/copilot/github-copilot-in-the-cli

---
## References
[Introducing the Azure Cosmos DB Agent Kit](https://devblogs.microsoft.com/cosmosdb/azure-cosmos-db-agent-kit-ai-coding-assistants/)

---

*CosmosDBOps v1.1.0 | Runtime operations via Azure MCP, integrated with cosmosdb-best-practices*



