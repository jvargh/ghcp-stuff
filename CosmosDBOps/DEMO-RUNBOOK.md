# CosmosDBOps Demo Runbook

Step-by-step scenarios demonstrating CosmosDBOps capabilities using Azure MCP to query live Cosmos DB resources.

---

## Prerequisites

```bash
# 1. GitHub Copilot CLI installed
ghcp --version

# 2. Azure CLI authenticated
az login
az account show

# 3. Azure MCP configured in ~/.copilot/mcp-config.json

# 4. Both skills installed
ls ~/.copilot/skills/
# Should show: cosmosdb-best-practices/, CosmosDBOps/

# 5. At least one Cosmos DB account in your subscription
az cosmosdb list -o table
```

---

## Scenario 1: Quick Health Check

**Goal:** Verify all Cosmos DB accounts are healthy

### Command
```
/cosmosdb status
```

### What It Does (via Azure MCP)
```
az cosmosdb list -o json
az monitor metrics list --resource {each_account} --metric ServiceAvailability
```

### Expected Output (Healthy)
```
✅ All systems green | 1 account | 0 throttling | 100% availability

Account: testingjv (MongoDB 7.0)
Regions: East US 2, West US 2
Status:  Online
```

### Expected Output (Issues Detected)
```
⚠️ Issues detected | 1 account | HIGH RU consumption

Account: testingjv (MongoDB 7.0)
Status:  NormalizedRUConsumption at 100%

Run /cosmosdb diagnose testingjv for details
```

---

## Scenario 2: Deep Diagnosis

**Goal:** Get root cause analysis with fix commands

### Command
```
/cosmosdb diagnose testingjv
```

### What It Does (via Azure MCP)
```
az cosmosdb show -n testingjv -g servicegroups-rg -o json
az cosmosdb mongodb database list -a testingjv -g servicegroups-rg
az cosmosdb mongodb collection list -a testingjv -g servicegroups-rg -d TestDB
az monitor metrics list --resource {id} --metric TotalRequests,NormalizedRUConsumption,ServiceAvailability
az monitor diagnostic-settings list --resource {id}
```

### Expected Output
```
═══════════════════════════════════════════════════════════════════════
                    COSMOS DB DIAGNOSIS: testingjv
═══════════════════════════════════════════════════════════════════════

ACCOUNT DETAILS
───────────────────────────────────────────────────────────────────────
Account:         testingjv (MongoDB 7.0)
Endpoint:        https://testingjv.documents.azure.com:443/
Regions:         East US 2 (write), West US 2 (read)
Consistency:     Session
Throughput:      400 RU/s (Manual) on TestDB/Orders

METRICS (Last 2 Hours)
───────────────────────────────────────────────────────────────────────
Total Requests:           10,024
Normalized RU Consumption: 100% ⚠️
Service Availability:     100%
Server-Side Latency:      6.09 ms

ISSUES DETECTED: 3
───────────────────────────────────────────────────────────────────────

🔴 ISSUE 1: HIGH RU CONSUMPTION (100%)
   WHAT: testingjv/TestDB/Orders hitting throughput ceiling
   WHY:  400 RU/s provisioned, demand exceeds capacity
   FIX:  az cosmosdb mongodb collection throughput migrate \
           -a testingjv -g servicegroups-rg -d TestDB -n Orders \
           --throughput-type autoscale

   📚 BEST PRACTICE: throughput-autoscale
      See: ~/.copilot/skills/cosmosdb-best-practices/rules/throughput-autoscale.md

🔴 ISSUE 2: NO ZONE REDUNDANCY
   WHAT: Both regions have isZoneRedundant=false
   WHY:  Zone failure within region causes unavailability
   FIX:  Cannot enable on existing account - requires migration

   📚 BEST PRACTICE: global-zone-redundancy
      See: ~/.copilot/skills/cosmosdb-best-practices/rules/global-zone-redundancy.md

🟡 ISSUE 3: PUBLIC NETWORK ACCESS
   WHAT: publicNetworkAccess=Enabled, no IP rules
   WHY:  Database accessible from any IP
   FIX:  az cosmosdb update -n testingjv -g servicegroups-rg \
           --ip-range-filter "YOUR_IP"

PASSING CHECKS: 10
───────────────────────────────────────────────────────────────────────
✅ Multi-region    ✅ Auto-failover   ✅ Burst capacity
✅ Diagnostics     ✅ Geo-backup      ✅ TLS 1.2
✅ 100% available  ✅ Low latency     ✅ Shard key defined
✅ Session consistency

SCORE: 77% (10/13 checks passing)
═══════════════════════════════════════════════════════════════════════
```

---

## Scenario 3: Performance Metrics

**Goal:** View RU consumption, latency, and availability

### Command
```
/cosmosdb metrics testingjv --timespan 2h
```

### What It Does (via Azure MCP)
```
az monitor metrics list \
  --resource /subscriptions/.../databaseAccounts/testingjv \
  --metric TotalRequests,TotalRequestUnits,NormalizedRUConsumption,ServiceAvailability,ServerSideLatency \
  --interval PT1H \
  --start-time {now-2h} \
  --end-time {now}
```

### Expected Output
```
📊 METRICS: testingjv (last 2 hours)

THROUGHPUT
─────────────────────────────────────────────────────
Total Requests:      10,024
Total RU Consumed:   397,241 RU
Avg RU/Request:      39.6 RU
Provisioned:         400 RU/s

RU CONSUMPTION
─────────────────────────────────────────────────────
Normalized RU:       100% (MAXED) ⚠️
                     ████████████████████ 100%

LATENCY
─────────────────────────────────────────────────────
Server-Side (avg):   6.09 ms ✅
Server-Side (max):   45 ms

AVAILABILITY
─────────────────────────────────────────────────────
Service Availability: 100% ✅
```

---

## Scenario 4: Throughput Analysis

**Goal:** Check current throughput and get recommendations

### Command
```
/cosmosdb throughput testingjv TestDB Orders
```

### What It Does (via Azure MCP)
```
az cosmosdb mongodb collection throughput show \
  -a testingjv -g servicegroups-rg -d TestDB -n Orders -o json
```

### Expected Output
```
📊 THROUGHPUT: testingjv/TestDB/Orders

CURRENT SETTINGS
─────────────────────────────────────────────────────
Throughput Type:     Manual
Provisioned RU/s:    400
Minimum RU/s:        400
Instant Max (burst): 10,000
Soft Max:            100,000

USAGE (from metrics)
─────────────────────────────────────────────────────
Avg RU/s consumed:   110 RU/s (28%)
Peak RU/s:           400+ (hitting ceiling)
Normalized RU:       100%

💡 RECOMMENDATION: Enable Autoscale
   Current usage is hitting the 400 RU/s ceiling.
   Autoscale would adjust between 400-4000 RU/s based on demand.

   az cosmosdb mongodb collection throughput migrate \
     -a testingjv -g servicegroups-rg -d TestDB -n Orders \
     --throughput-type autoscale
```

---

## Scenario 5: Scale Throughput

**Goal:** Increase container throughput

### Command
```
/cosmosdb scale testingjv TestDB Orders --ru 1000
```

### What It Does (via Azure MCP)
```
az cosmosdb mongodb collection throughput update \
  -a testingjv -g servicegroups-rg -d TestDB -n Orders \
  --throughput 1000
```

### Expected Output
```
✅ THROUGHPUT UPDATED

Account:    testingjv
Database:   TestDB
Collection: Orders

Before:     400 RU/s
After:      1000 RU/s

Change:     +600 RU/s (+150%)
Est. Cost:  ~$58/month → ~$146/month

Effective immediately.
```

---

## Scenario 6: Generate Support Case

**Goal:** Collect all diagnostics into a support case format

### Command
```
/cosmosdb case testingjv
```

### What It Does (via Azure MCP)
```
az account show
az cosmosdb show -n testingjv -g servicegroups-rg
az cosmosdb mongodb database list -a testingjv -g servicegroups-rg
az cosmosdb mongodb collection list -a testingjv -g servicegroups-rg -d TestDB
az cosmosdb mongodb collection throughput show -a testingjv -g servicegroups-rg -d TestDB -n Orders
az monitor metrics list --resource {id} --metric {all}
az monitor diagnostic-settings list --resource {id}
```

### Expected Output
```
═══════════════════════════════════════════════════════════════════════════════
                    AZURE SUPPORT CASE - COSMOS DB
═══════════════════════════════════════════════════════════════════════════════

CASE SUMMARY
─────────────────────────────────────────────────────────────────────────────────
Title:           Cosmos DB High RU Consumption & Best Practice Review - testingjv
Severity:        🟡 Medium
Generated:       2026-01-25T23:45:00Z
Status:          Action Required

AZURE CONTEXT
─────────────────────────────────────────────────────────────────────────────────
Subscription ID:   463a82d4-1896-4332-aeeb-618ee5a5aa93
Subscription Name: ME-MngEnvMCAP993834-varghesejoji-1
Tenant ID:         5bb5fa45-2dcc-4310-bbc5-883021e9d84b
Resource Group:    servicegroups-rg
Resource URI:      /subscriptions/.../databaseAccounts/testingjv

ACCOUNT DETAILS
─────────────────────────────────────────────────────────────────────────────────
Account Name:      testingjv
Endpoint:          https://testingjv.documents.azure.com:443/
API Type:          MongoDB 7.0
Consistency:       Session
Write Region:      East US 2
Read Regions:      East US 2, West US 2
Zone Redundant:    ❌ No (both regions)
Auto-Failover:     ✅ Enabled
Burst Capacity:    ✅ Enabled

DATABASE & COLLECTION
─────────────────────────────────────────────────────────────────────────────────
Database:          TestDB
Collection:        Orders
Shard Key:         customerId (Hash)
Throughput:        400 RU/s (Manual)

PERFORMANCE METRICS
─────────────────────────────────────────────────────────────────────────────────
Total Requests:           10,024
Normalized RU Consumption: 100% ⚠️
Service Availability:     100%
Server-Side Latency:      6.09 ms

ISSUES DETECTED: 3
─────────────────────────────────────────────────────────────────────────────────
🔴 HIGH RU CONSUMPTION     → throughput-autoscale
🔴 NO ZONE REDUNDANCY      → global-zone-redundancy
🟡 PUBLIC NETWORK ACCESS   → (security hardening)

PASSING CHECKS: 10
─────────────────────────────────────────────────────────────────────────────────
✅ Multi-region ✅ Auto-failover ✅ Burst capacity ✅ Diagnostics
✅ Geo-backup   ✅ TLS 1.2       ✅ 100% available ✅ Low latency

RECOMMENDED ACTIONS
─────────────────────────────────────────────────────────────────────────────────
Priority 1: Enable autoscale (fixes RU consumption)
Priority 2: Add IP restriction (security)
Priority 3: Plan zone-redundant migration (HA)

SCORE: 77% (10/13 checks passing)
═══════════════════════════════════════════════════════════════════════════════
                         Generated by CosmosDBOps v1.1.0
═══════════════════════════════════════════════════════════════════════════════
```

---

## Scenario 7: Export Diagnostics

**Goal:** Create a ZIP archive for offline analysis

### Command
```
/cosmosdb logs --export --timespan 4h
```

### What It Does (via Azure MCP)
```
az cosmosdb show -n testingjv -g servicegroups-rg -o json > account-config.json
az cosmosdb mongodb database list -a testingjv -g servicegroups-rg -o json > databases.json
az cosmosdb mongodb collection list -a testingjv -g servicegroups-rg -d TestDB -o json > collections.json
az monitor metrics list --resource {id} --metric {all} -o json > metrics.json
az monitor activity-log list --resource-id {id} -o json > activity-log.json
az monitor diagnostic-settings list --resource {id} -o json > diagnostic-settings.json
```

### Expected Output
```
📦 DIAGNOSTIC EXPORT

Collecting data via Azure MCP...
✅ Account configuration
✅ Databases and collections
✅ Throughput settings
✅ Performance metrics (4h)
✅ Activity log
✅ Diagnostic settings
✅ Generating summary

Archive created:
~/Desktop/cosmosdb-logs-testingjv-2026-01-25-234500.zip

Contents:
─────────────────────────────────────────────────────
SUMMARY.md              Issue summary with recommendations
account-config.json     Full account configuration
databases.json          Database list
collections.json        Collection configs
throughput.json         Throughput settings
metrics.json            All performance metrics
activity-log.json       Recent management operations
diagnostic-settings.json Logging configuration
─────────────────────────────────────────────────────

Total size: 156 KB
```

---

## Troubleshooting

### Command Not Recognized

```
Error: /cosmosdb is not a recognized command
```

**Fix:**
```bash
# Verify skill is installed
ls ~/.copilot/skills/CosmosDBOps/

# Reload skills
/skills reload
```

### Azure MCP Not Connected

```
Error: Unable to execute az command
```

**Fix:**
```bash
# Verify Azure CLI authentication
az account show

# Check MCP configuration
cat ~/.copilot/mcp-config.json
```

### No Accounts Found

```
Output: No Cosmos DB accounts found in subscription
```

**Fix:**
```bash
# Verify subscription
az account show

# List accounts manually
az cosmosdb list -o table

# Set correct subscription
az account set --subscription "CORRECT_SUBSCRIPTION_ID"
```

### Metrics Not Available

```
Output: Metrics data unavailable
```

**Possible causes:**
- Account recently created (metrics take ~5 min to populate)
- Diagnostic settings not enabled
- Timespan too narrow

**Fix:**
```bash
# Check diagnostic settings
az monitor diagnostic-settings list \
  --resource /subscriptions/.../databaseAccounts/testingjv

# Enable if missing
az monitor diagnostic-settings create \
  --name cosmosdb-diagnostics \
  --resource /subscriptions/.../databaseAccounts/testingjv \
  --metrics '[{"category":"Requests","enabled":true}]'
```

---

## Quick Reference

| Command | Purpose | Key Azure MCP Call |
|---------|---------|-------------------|
| `/cosmosdb status` | Health check | `az cosmosdb list` |
| `/cosmosdb diagnose <acct>` | Root cause analysis | All APIs combined |
| `/cosmosdb metrics <acct>` | Performance data | `az monitor metrics list` |
| `/cosmosdb throughput <acct> <db> <coll>` | Throughput info | `az cosmosdb ... throughput show` |
| `/cosmosdb scale <acct> <db> <coll> --ru N` | Scale RU/s | `az cosmosdb ... throughput update` |
| `/cosmosdb case <acct>` | Support case | Full diagnostic collection |
| `/cosmosdb logs --export` | ZIP archive | All diagnostic data |

---

*CosmosDBOps v1.1.0 Demo Runbook | Azure MCP + cosmosdb-best-practices*
