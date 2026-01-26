# CosmosDBOps Architecture

How CosmosDBOps uses Azure MCP to query live Azure resources and integrates with Microsoft's cosmosdb-best-practices skill.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                USER                                         │
│                         "/cosmosdb diagnose sample-cosmos"                      │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB COPILOT CLI                                 │
│                                                                             │
│   1. Parses command: /cosmosdb diagnose sample-cosmos                           │
│   2. Loads skill: ~/.copilot/skills/CosmosDBOps/SKILL.md                    │
│   3. Identifies MCP dependency: azure-mcp                                   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CosmosDBOps SKILL                                 │
│                  ~/.copilot/skills/CosmosDBOps/SKILL.md                     │
│                                                                             │
│   • Defines /cosmosdb commands (status, diagnose, metrics, case, etc.)      │
│   • Specifies response format: WHAT/WHY/FIX                                 │
│   • Maps issues to cosmosdb-best-practices rules                            │
│   • Declares: mcp_servers: [azure-mcp]                                      │
│   • Declares: related_skills: [cosmosdb-best-practices]                     │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
              v                                               v
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│        AZURE MCP SERVER         │         │    cosmosdb-best-practices      │
│   (Model Context Protocol)      │         │       (Microsoft Skill)         │
│                                 │         │                                 │
│  Executes Azure CLI commands:   │         │  Provides rule references:      │
│  • az cosmosdb show             │         │  • throughput-autoscale.md      │
│  • az cosmosdb mongodb ...      │         │  • global-zone-redundancy.md    │
│  • az monitor metrics list      │         │  • partition-avoid-hotspots.md  │
│  • az monitor activity-log      │         │  • monitoring-throttling.md     │
│  • az monitor diagnostic-settings│        │  • 45+ rules total              │
└─────────────────────────────────┘         └─────────────────────────────────┘
              │                                               │
              v                                               │
┌─────────────────────────────────┐                           │
│         AZURE ARM APIs          │                           │
│                                 │                           │
│  • Cosmos DB Resource Provider  │                           │
│  • Azure Monitor                │                           │
│  • Activity Log                 │                           │
│  • Diagnostic Settings          │                           │
└─────────────────────────────────┘                           │
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                                      v
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DIAGNOSIS OUTPUT                                  │
│                                                                             │
│   🔴 ISSUE: HIGH RU CONSUMPTION (100%)                                      │
│   WHAT: sample-cosmos/TestDB/Orders hitting throughput ceiling                  │
│   WHY:  400 RU/s provisioned, demand exceeds capacity                       │
│   FIX:  az cosmosdb mongodb collection throughput migrate ...               │
│                                                                             │
│   📚 BEST PRACTICE: throughput-autoscale                                    │
│      See: ~/.copilot/skills/cosmosdb-best-practices/rules/                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. GitHub Copilot CLI

The runtime environment that:
- Loads skill definitions from `~/.copilot/skills/`
- Connects to configured MCP servers via `~/.copilot/mcp-config.json`
- Routes `/cosmosdb` commands to CosmosDBOps skill

### 2. CosmosDBOps Skill

```
~/.copilot/skills/CosmosDBOps/
├── SKILL.md     ← Skill definition (commands, behavior, MCP mappings)
└── VERSION      ← 1.1.0
```

**SKILL.md Header:**
```yaml
---
name: CosmosDBOps
description: Azure Cosmos DB incident response agent
version: 1.1.0
mcp_servers:
  - azure-mcp
related_skills:
  - cosmosdb-best-practices
---
```

### 3. Azure MCP Server

Configured in `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "azure-mcp": {
      "type": "stdio",
      "command": "azure-mcp",
      "args": ["--transport", "stdio"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "your-subscription-id"
      }
    }
  }
}
```

**Provides these Azure CLI capabilities:**

| Category | Commands |
|----------|----------|
| Account | `az cosmosdb show`, `az cosmosdb list` |
| MongoDB | `az cosmosdb mongodb database list`, `collection list/show` |
| Throughput | `az cosmosdb mongodb collection throughput show/update/migrate` |
| Metrics | `az monitor metrics list` |
| Logs | `az monitor activity-log list` |
| Diagnostics | `az monitor diagnostic-settings list/create` |

### 4. cosmosdb-best-practices Skill (Microsoft)

```
~/.copilot/skills/cosmosdb-best-practices/
├── SKILL.md      ← Skill definition
├── AGENTS.md     ← Full compiled rules
└── rules/        ← 45+ individual rule files
    ├── partition-avoid-hotspots.md
    ├── throughput-autoscale.md
    ├── global-zone-redundancy.md
    ├── monitoring-throttling.md
    └── ...
```

CosmosDBOps references these rules when issues are detected.

---

## Data Flow: `/cosmosdb diagnose`

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL DATA COLLECTION                          │
│                           (via Azure MCP)                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│  │  Account Config    │  │  Performance       │  │  Diagnostic        │  │
│  │                    │  │  Metrics           │  │  Settings          │  │
│  │  az cosmosdb show  │  │  az monitor        │  │  az monitor        │  │
│  │  -n sample-cosmos      │  │  metrics list      │  │  diagnostic-       │  │
│  │  -g rg             │  │  --metric:         │  │  settings list     │  │
│  │                    │  │  TotalRequests     │  │                    │  │
│  │  Returns:          │  │  NormalizedRU      │  │  Returns:          │  │
│  │  • API type        │  │  ServiceAvail      │  │  • Log Analytics   │  │
│  │  • Regions         │  │  ServerLatency     │  │    workspace       │  │
│  │  • Zone redundancy │  │                    │  │  • Enabled logs    │  │
│  │  • Consistency     │  │  Returns:          │  │  • Enabled metrics │  │
│  │  • Backup policy   │  │  • RU consumption  │  │                    │  │
│  │  • Network config  │  │  • Throttle rate   │  │                    │  │
│  │                    │  │  • Availability %  │  │                    │  │
│  └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘  │
│            │                       │                       │             │
└────────────┼───────────────────────┼───────────────────────┼─────────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     v
┌──────────────────────────────────────────────────────────────────────────┐
│                         ANALYSIS ENGINE                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CHECK 1: Throttling                                                     │
│  ─────────────────────                                                   │
│  IF NormalizedRUConsumption >= 90%                                       │
│  THEN issue = "HIGH_RU_CONSUMPTION"                                      │
│       rule = "throughput-autoscale"                                      │
│                                                                          │
│  CHECK 2: Zone Redundancy                                                │
│  ────────────────────────                                                │
│  IF any region has isZoneRedundant = false                               │
│  THEN issue = "NO_ZONE_REDUNDANCY"                                       │
│       rule = "global-zone-redundancy"                                    │
│                                                                          │
│  CHECK 3: Multi-Region                                                   │
│  ─────────────────────                                                   │
│  IF locations.length == 1                                                │
│  THEN issue = "SINGLE_REGION"                                            │
│       rule = "global-multi-region"                                       │
│                                                                          │
│  CHECK 4: Network Isolation                                              │
│  ──────────────────────────                                              │
│  IF publicNetworkAccess = "Enabled" AND ipRules = [] AND vnetRules = []  │
│  THEN issue = "PUBLIC_NETWORK_ACCESS"                                    │
│                                                                          │
│  CHECK 5: Diagnostics                                                    │
│  ────────────────────                                                    │
│  IF diagnostic-settings = []                                             │
│  THEN issue = "NO_DIAGNOSTICS"                                           │
│       rule = "monitoring-diagnostic-logs"                                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                                     v
┌──────────────────────────────────────────────────────────────────────────┐
│                        OUTPUT GENERATION                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  For each issue:                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 🔴 ISSUE: {issue_title}                                            │  │
│  │                                                                    │  │
│  │ WHAT: {resource} - {state}                                         │  │
│  │ WHY:  {root_cause_with_evidence}                                   │  │
│  │ FIX:  {az_cli_command}                                             │  │
│  │                                                                    │  │
│  │ 📚 BEST PRACTICE: {rule_name}                                      │  │
│  │    See: ~/.copilot/skills/cosmosdb-best-practices/rules/{rule}.md  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Azure MCP Commands Used

### Account Operations

| Operation | Azure CLI Command |
|-----------|-------------------|
| List accounts | `az cosmosdb list -o json` |
| Get account details | `az cosmosdb show -n {name} -g {rg} -o json` |
| Update account | `az cosmosdb update -n {name} -g {rg} --enable-burst-capacity true` |

### MongoDB API Operations

| Operation | Azure CLI Command |
|-----------|-------------------|
| List databases | `az cosmosdb mongodb database list -a {account} -g {rg}` |
| List collections | `az cosmosdb mongodb collection list -a {account} -g {rg} -d {db}` |
| Get collection | `az cosmosdb mongodb collection show -a {account} -g {rg} -d {db} -n {coll}` |
| Get throughput | `az cosmosdb mongodb collection throughput show -a {account} -g {rg} -d {db} -n {coll}` |
| Update throughput | `az cosmosdb mongodb collection throughput update ... --throughput {N}` |
| Enable autoscale | `az cosmosdb mongodb collection throughput migrate ... --throughput-type autoscale` |

### Monitoring Operations

| Operation | Azure CLI Command |
|-----------|-------------------|
| Get metrics | `az monitor metrics list --resource {id} --metric TotalRequests,NormalizedRUConsumption,ServiceAvailability` |
| Get activity log | `az monitor activity-log list --resource-id {id}` |
| Get diagnostic settings | `az monitor diagnostic-settings list --resource {id}` |
| Create diagnostic settings | `az monitor diagnostic-settings create --name {name} --resource {id} --workspace {ws}` |

---

## Integration Points

### With cosmosdb-best-practices

```
CosmosDBOps detects at runtime          cosmosdb-best-practices provides
────────────────────────────────        ─────────────────────────────────
NormalizedRUConsumption = 100%    →     rules/throughput-autoscale.md
isZoneRedundant = false           →     rules/global-zone-redundancy.md
locations.length == 1             →     rules/global-multi-region.md
Hot partition detected            →     rules/partition-avoid-hotspots.md
No diagnostic settings            →     rules/monitoring-diagnostic-logs.md
High 429 error rate               →     rules/monitoring-throttling.md
```

### With Azure MCP

```
~/.copilot/mcp-config.json
         │
         v
┌─────────────────────────┐
│     azure-mcp server    │
│                         │
│  Authenticates via:     │
│  • az login session     │
│  • AZURE_SUBSCRIPTION_ID│
│                         │
│  Executes:              │
│  • az cosmosdb ...      │
│  • az monitor ...       │
└─────────────────────────┘
```

---

## Security Model

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User authenticates once:  az login                                      │
│                                                                          │
│  CosmosDBOps inherits credentials via Azure MCP                          │
│  No additional credentials stored in skill                               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                          AUTHORIZATION                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Required RBAC roles for read-only diagnosis:                            │
│  • Cosmos DB Account Reader                                              │
│  • Monitoring Reader                                                     │
│                                                                          │
│  Required RBAC roles for operations (scale, failover):                   │
│  • Cosmos DB Operator                                                    │
│  • Cosmos DB Contributor                                                 │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                          DATA HANDLING                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  • No customer data accessed (metadata and metrics only)                 │
│  • Connection strings/keys not displayed by default                      │
│  • Exported logs may contain resource IDs (no secrets)                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

*CosmosDBOps v1.1.0 Architecture | Azure MCP + cosmosdb-best-practices Integration*

