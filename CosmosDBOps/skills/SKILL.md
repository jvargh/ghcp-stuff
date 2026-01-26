---
name: CosmosDBOps
description: Azure Cosmos DB incident response agent. Quickly identify and diagnose issues in Cosmos DB accounts including throughput, latency, partitioning, and availability.
version: 1.1.0
mcp_servers:
  - azure-mcp
related_skills:
  - cosmosdb-best-practices
---

# CosmosDBOps - Azure Cosmos DB Incident Response Agent

Fast root cause analysis for Azure Cosmos DB issues. Uses Azure MCP Server for all operations.

**Integrates with:** `cosmosdb-best-practices` skill for code-level remediation guidance.

## Response Model

| Scenario | Response |
|----------|----------|
| **All healthy** | `✅ All systems green` (one line) |
| **Issues found** | Detailed root cause report with fix + reference to best practice rule |

---

## Integration with cosmosdb-best-practices

When CosmosDBOps detects runtime issues, reference the corresponding `cosmosdb-best-practices` rule for code-level guidance:

| Runtime Issue (CosmosDBOps) | Best Practice Rule | Rule File |
|-----------------------------|-------------------|-----------|
| High throttling (429s) | `monitoring-throttling` | `~/.copilot/skills/cosmosdb-best-practices/rules/monitoring-throttling.md` |
| Hot partition detected | `partition-avoid-hotspots` | `~/.copilot/skills/cosmosdb-best-practices/rules/partition-avoid-hotspots.md` |
| No zone redundancy | `global-zone-redundancy` | `~/.copilot/skills/cosmosdb-best-practices/rules/global-zone-redundancy.md` |
| Single region | `global-multi-region` | `~/.copilot/skills/cosmosdb-best-practices/rules/global-multi-region.md` |
| High latency | `sdk-connection-mode` | `~/.copilot/skills/cosmosdb-best-practices/rules/sdk-connection-mode.md` |
| Cross-partition queries | `query-avoid-cross-partition` | `~/.copilot/skills/cosmosdb-best-practices/rules/query-avoid-cross-partition.md` |
| No diagnostic settings | `monitoring-diagnostic-logs` | `~/.copilot/skills/cosmosdb-best-practices/rules/monitoring-diagnostic-logs.md` |
| Autoscale not enabled | `throughput-autoscale` | `~/.copilot/skills/cosmosdb-best-practices/rules/throughput-autoscale.md` |

### Output Format with Best Practice Reference

```
🚨 ISSUE: High Request Throttling (429)

WHAT: testingjv/TestDB/Orders - 25% requests throttled
WHY:  Provisioned 400 RU/s, peak load 650 RU/s
FIX:  az cosmosdb mongodb collection throughput update \
        -a testingjv -g servicegroups-rg -d TestDB -n Orders \
        --throughput 1000

📚 BEST PRACTICE: monitoring-throttling
   See: ~/.copilot/skills/cosmosdb-best-practices/rules/monitoring-throttling.md
   - Set up Azure Monitor alerts for 429s
   - Implement SDK diagnostics logging
   - Consider autoscale for variable workloads
```

---

## Commands

### `/cosmosdb status`
Quick health check across all Cosmos DB accounts. Returns green or identifies issues.

### `/cosmosdb diagnose [account-name]`
Deep dive into account issues with root cause and remediation.

### `/cosmosdb metrics <account-name> [--timespan 1h]`
Get key performance metrics (RU consumption, throttling, latency).

### `/cosmosdb logs --aggregate [--timespan 1h]`
Aggregate logs from diagnostic settings, metrics, and activity log correlated by time.

### `/cosmosdb logs --export [--timespan 1h]`
Export all diagnostic data to ZIP archive for offline analysis or support cases.

### `/cosmosdb case [account-name]`
**Generate a support case template** with all diagnostic details pre-filled.

### `/cosmosdb partitions <account-name> <database> <container>`
Analyze partition key distribution and identify hot partitions.

### `/cosmosdb throughput <account-name> <database> [container]`
Show current throughput settings and recommendations.

### `/cosmosdb scale <account-name> <database> <container> --ru <value>`
Scale container throughput (manual provisioned).

### `/cosmosdb failover <account-name> --region <region>`
Initiate manual failover to specified region.

---

## Supported Account Types

| API Type | Azure CLI | Description |
|----------|-----------|-------------|
| **NoSQL (Core)** | `az cosmosdb sql` | Document database with SQL query |
| **MongoDB** | `az cosmosdb mongodb` | MongoDB-compatible API |
| **Cassandra** | `az cosmosdb cassandra` | Cassandra-compatible API |
| **Gremlin** | `az cosmosdb gremlin` | Graph database |
| **Table** | `az cosmosdb table` | Table storage API |

---

## Support Case Template

The `/cosmosdb case` command generates a structured support case template ready to submit to Microsoft Support.

### Case Template Fields

| Field | Source | Description |
|-------|--------|-------------|
| **Title** | Auto-generated | Brief issue summary (e.g., "Cosmos DB High Throttling - myaccount") |
| **Severity** | Auto-detected | Critical / High / Medium / Low |
| **Description** | Auto-generated | Detailed problem description with symptoms |
| **Problem Start Time** | Metrics/Logs | First occurrence timestamp (UTC) |
| **Current Status** | Live check | Ongoing / Resolved / Intermittent |
| **Subscription ID** | `az account show` | Azure subscription GUID |
| **Subscription Name** | `az account show` | Azure subscription display name |
| **Tenant ID** | `az account show` | Azure AD tenant GUID |
| **Resource Group** | Account config | Resource group containing the account |
| **Resource URI** | Account config | Full ARM resource ID |
| **Account Name** | Account config | Cosmos DB account name |
| **Account Endpoint** | Account config | Document endpoint URL |
| **API Type** | Account config | NoSQL, MongoDB, Cassandra, Gremlin, Table |
| **Consistency Level** | Account config | Strong, Bounded Staleness, Session, Eventual |
| **Regions** | Account config | List of read/write regions |
| **Affected Database** | Diagnosis | Specific database name if applicable |
| **Affected Container** | Diagnosis | Specific container name if applicable |
| **Initial Triage Outcomes** | Auto-analysis | What was checked and findings |
| **Suggested Root Cause** | AI analysis | Most likely cause based on evidence |
| **Evidence Summary** | Metrics/Logs | Key metrics and log entries |
| **Remediation Attempted** | Tracking | Actions already taken |
| **Attachments** | Auto-generated | Reference to exported diagnostic archive |

### Case Template Generation Workflow

```yaml
# 1. Get Azure context
az account show -o json
  → subscription_id, subscription_name, tenant_id

# 2. Get account details
az cosmosdb show -n <account> -g <rg> -o json
  → resource_uri, endpoint, api_type, consistency, regions

# 3. Get database/container details
az cosmosdb sql database list -a <account> -g <rg>
az cosmosdb sql container list -a <account> -g <rg> -d <db>
  → databases, containers, throughput_settings

# 4. Run diagnosis
/cosmosdb diagnose <account>
  → issues, severity, root_cause, affected_resources

# 5. Get metrics
az monitor metrics list --resource <id> --metric "TotalRequests,TotalRequestUnits,ThrottledRequests"
  → problem_start_time, evidence

# 6. Generate case template markdown file
  → ~/Desktop/CosmosDB-Support-Case-<account>-<timestamp>.md
```

### Case Template Output Format

```markdown
# Azure Support Case - Cosmos DB Incident

## Case Summary
| Field | Value |
|-------|-------|
| **Title** | Cosmos DB High Throttling - myaccount |
| **Severity** | 🔴 Critical |
| **Problem Start Time** | 2026-01-25T17:30:00Z |
| **Current Status** | Ongoing |

## Azure Context
| Field | Value |
|-------|-------|
| **Subscription ID** | 463a82d4-1896-4332-aeeb-618ee5a5aa93 |
| **Subscription Name** | MySubscription |
| **Tenant ID** | <tenant-guid> |
| **Resource Group** | cosmosdb-rg |
| **Resource URI** | /subscriptions/.../databaseAccounts/myaccount |

## Account Details
| Field | Value |
|-------|-------|
| **Account Name** | myaccount |
| **Endpoint** | https://myaccount.documents.azure.com:443/ |
| **API Type** | NoSQL (SQL) |
| **Consistency** | Session |
| **Write Region** | East US |
| **Read Regions** | East US, West US |

## Problem Description

Cosmos DB account `myaccount` is experiencing high request throttling (429 errors) affecting approximately 25% of requests.
Database: orders, Container: items

## Affected Resources

| Type | Name | Status |
|------|------|--------|
| Database | orders | Degraded |
| Container | items | High Throttling |
| Partition | /tenantId=acme-corp | Hot Partition |

## Initial Triage Outcomes

| Check | Result |
|-------|--------|
| Account State | ✅ Online |
| Network Connectivity | ✅ Accessible |
| Provisioned RU/s | ⚠️ 400 RU/s (low) |
| Throttle Rate | ❌ 25% requests |
| Latency P99 | ⚠️ 48ms (elevated) |
| Partition Balance | ❌ Skewed |

## Suggested Root Cause

**Hot partition on /tenantId = "acme-corp"**

One logical partition is consuming 80% of the provisioned throughput, causing other partitions to be throttled.

## Evidence Summary

| Timestamp | Metric | Value |
|-----------|--------|-------|
| 17:30:00 | Throttled Requests | 1,250 |
| 17:30:00 | Total Requests | 5,000 |
| 17:30:00 | Max RU/s per Partition | 320/400 |
| 17:35:00 | Throttled Requests | 1,480 |

## Recommended Fix

1. Increase throughput:
```bash
az cosmosdb sql container throughput update \
  -a myaccount -g cosmosdb-rg -d orders -n items \
  --throughput 4000
```

2. Or enable autoscale:
```bash
az cosmosdb sql container throughput migrate \
  -a myaccount -g cosmosdb-rg -d orders -n items \
  --throughput-type autoscale
```

---
*Generated by CosmosDBOps v1.0.0 | <timestamp>*
```

### Output Location

```
~/Desktop/CosmosDB-Support-Case-<account>-<timestamp>.md
```

---

## Log Export Feature

The `/cosmosdb logs --export` command creates a comprehensive ZIP archive containing all diagnostic data.

### Export Contents

| File | Description |
|------|-------------|
| `SUMMARY.md` | Issue summary with root cause and remediation |
| `account-config.json` | Full account configuration |
| `databases.json` | List of databases and settings |
| `containers.json` | Container configurations and throughput |
| `metrics-requests.json` | Request count and RU consumption |
| `metrics-latency.json` | Server-side latency metrics |
| `metrics-throttling.json` | Throttled requests metrics |
| `metrics-availability.json` | Availability percentage |
| `partition-stats.json` | Partition key statistics |
| `activity-log.json` | Recent management operations |
| `diagnostic-settings.json` | Diagnostic log configuration |

### Export Workflow

```yaml
# 1. Create timestamped directory
mkdir ~/Desktop/cosmosdb-logs-YYYY-MM-DD-HHMMSS/

# 2. Export account configuration
az cosmosdb show -n <account> -g <rg> -o json → account-config.json
az cosmosdb sql database list -a <account> -g <rg> -o json → databases.json
az cosmosdb sql container list -a <account> -g <rg> -d <db> -o json → containers.json

# 3. Export metrics
az monitor metrics list --resource <id> --metric "TotalRequests,TotalRequestUnits" → metrics-requests.json
az monitor metrics list --resource <id> --metric "ServerSideLatency,ServerSideLatencyDirect" → metrics-latency.json
az monitor metrics list --resource <id> --metric "TotalRequestUnits,ThrottledRequests" → metrics-throttling.json
az monitor metrics list --resource <id> --metric "ServiceAvailability" → metrics-availability.json

# 4. Export partition stats (if available)
az cosmosdb sql container retrieve-partition-throughput -a <account> -g <rg> -d <db> -n <container> → partition-stats.json

# 5. Export activity log
az monitor activity-log list --resource-id <id> → activity-log.json

# 6. Generate SUMMARY.md with issues and recommendations

# 7. Create ZIP archive
Compress-Archive → cosmosdb-logs-YYYY-MM-DD-HHMMSS.zip
```

### Output Location

```
~/Desktop/cosmosdb-logs-YYYY-MM-DD-HHMMSS.zip
```

---

## Log Aggregation

The `/cosmosdb logs --aggregate` command pulls data from multiple sources and correlates them by timestamp.

### Data Sources

| Source | Azure CLI / Tool | What it captures |
|--------|------------------|------------------|
| **Request Metrics** | `az monitor metrics list` | TotalRequests, TotalRequestUnits |
| **Throttling Metrics** | `az monitor metrics list` | ThrottledRequests by status code |
| **Latency Metrics** | `az monitor metrics list` | ServerSideLatency, P50, P99 |
| **Availability** | `az monitor metrics list` | ServiceAvailability |
| **Activity Log** | `az monitor activity-log list` | Account changes, failovers |
| **Diagnostic Logs** | Log Analytics KQL | DataPlaneRequests, ControlPlaneRequests |

### Aggregated Output Format

```
📊 LOG AGGREGATION: <account-name> (last 1h)

TIMELINE:
─────────────────────────────────────────────────────
14:20:00 [ACTIVITY]   Throughput updated: 400 → 800 RU/s
14:25:15 [METRIC]     Throttled requests spike: 0 → 450/min
14:25:20 [METRIC]     P99 latency: 12ms → 89ms
14:30:00 [ACTIVITY]   Container scaling operation started
14:32:00 [METRIC]     Throttling resolved
─────────────────────────────────────────────────────

🔴 ROOT CAUSE: <description>

WHAT: <resource>
WHY:  <evidence>
FIX:  <command>
```

---

## MCP Tools Used

| Action | Azure CLI Command |
|--------|-------------------|
| List accounts | `az cosmosdb list -o table` |
| Account details | `az cosmosdb show -n X -g Y -o json` |
| List databases (SQL) | `az cosmosdb sql database list -a X -g Y` |
| List containers (SQL) | `az cosmosdb sql container list -a X -g Y -d Z` |
| Container throughput | `az cosmosdb sql container throughput show -a X -g Y -d Z -n C` |
| Update throughput | `az cosmosdb sql container throughput update -a X -g Y -d Z -n C --throughput N` |
| Migrate to autoscale | `az cosmosdb sql container throughput migrate -a X -g Y -d Z -n C --throughput-type autoscale` |
| Request metrics | `az monitor metrics list --resource <id> --metric TotalRequests,TotalRequestUnits` |
| Throttle metrics | `az monitor metrics list --resource <id> --metric ThrottledRequests` |
| Latency metrics | `az monitor metrics list --resource <id> --metric ServerSideLatency` |
| Availability | `az monitor metrics list --resource <id> --metric ServiceAvailability` |
| Activity log | `az monitor activity-log list --resource-id <id>` |
| Manual failover | `az cosmosdb failover-priority-change -n X -g Y --failover-policies regionName=priority` |
| Network rules | `az cosmosdb network-rule list -n X -g Y` |
| Keys | `az cosmosdb keys list -n X -g Y` |

---

## Issue Detection

**Automatic checks when running `/cosmosdb status` or `/cosmosdb diagnose`:**

1. Account state (Online/Offline)
2. Throttling rate (429 errors in last hour)
3. Request latency (P99 > 100ms warning)
4. RU consumption vs provisioned
5. Partition balance (hot partition detection)
6. Region availability
7. Consistency configuration
8. Backup policy compliance
9. Network security (VNet, firewall rules)
10. Diagnostic settings enabled

---

## Common Issues Detected

| Issue | Detection Method | Auto-Fix Available |
|-------|-----------------|-------------------|
| High throttling (429s) | ThrottledRequests metric | Scale RU/s |
| Hot partition | Partition throughput skew | Alert only |
| High latency | ServerSideLatency P99 | Diagnose |
| Low availability | ServiceAvailability < 99.99% | Failover |
| No zone redundancy | Account config | Enable (recreate) |
| Single region | Account config | Add region |
| Network blocked | Connection test | Update firewall |
| Backup not configured | Backup policy check | Configure |
| Diagnostics disabled | Diagnostic settings | Enable |
| Consistency mismatch | App vs account config | Alert only |

---

## Output Format (When Issues Found)

```
🚨 ISSUE: <brief description>

WHAT: <account/database/container> in <state>
WHY:  <root cause from metrics/logs>
FIX:  <exact command to resolve>
```

---

## MongoDB API Specific Commands

### `/cosmosdb mongo databases <account-name>`
List MongoDB databases with throughput settings.

### `/cosmosdb mongo collections <account-name> <database>`
List collections with sharding and index info.

---

## Cassandra API Specific Commands

### `/cosmosdb cassandra keyspaces <account-name>`
List Cassandra keyspaces with throughput.

### `/cosmosdb cassandra tables <account-name> <keyspace>`
List tables with schema and throughput.

---

## Key Metrics Reference

| Metric | Description | Threshold |
|--------|-------------|-----------|
| `TotalRequests` | Total request count | Baseline |
| `TotalRequestUnits` | Total RU consumed | < Provisioned |
| `ThrottledRequests` | 429 error count | Should be 0 |
| `ServerSideLatency` | P50/P99 latency | < 10ms P50, < 100ms P99 |
| `ServiceAvailability` | Uptime percentage | > 99.99% |
| `ProvisionedThroughput` | Configured RU/s | Varies |
| `AutoscaleMaxThroughput` | Max autoscale RU/s | Varies |
| `NormalizedRUConsumption` | RU usage per partition | < 70% |
| `DataUsage` | Storage consumed | < limit |
| `IndexUsage` | Index storage | Optimize if high |

---

## Best Practices Checks

The skill validates configuration against CosmosDB best practices and references the `cosmosdb-best-practices` skill rules:

### High Availability
- [ ] Zone redundancy enabled → `global-zone-redundancy`
- [ ] Multi-region configured → `global-multi-region`
- [ ] Automatic failover enabled → `global-failover`

### Performance
- [ ] Appropriate partition key → `partition-high-cardinality`, `partition-avoid-hotspots`
- [ ] Indexing policy optimized → `index-exclude-unused`, `index-composite`
- [ ] Connection mode Direct (not Gateway) → `sdk-connection-mode`

### Security
- [ ] Network isolation (VNet/Private Endpoint)
- [ ] Managed identity for access
- [ ] TLS 1.2+ enforced

### Operations
- [ ] Diagnostic settings configured → `monitoring-diagnostic-logs`
- [ ] Backup policy appropriate
- [ ] Alerts configured → `monitoring-throttling`, `monitoring-latency`

---

## cosmosdb-best-practices Rule Reference

Full mapping of CosmosDBOps detections to `cosmosdb-best-practices` rules at `~/.copilot/skills/cosmosdb-best-practices/rules/`:

### Data Modeling (CRITICAL)
| Rule | File | When Referenced |
|------|------|-----------------|
| `model-embed-related` | `model-embed-related.md` | High RU queries detected |
| `model-avoid-2mb-limit` | `model-avoid-2mb-limit.md` | Large document errors |
| `model-denormalize-reads` | `model-denormalize-reads.md` | High read latency |

### Partition Key Design (CRITICAL)
| Rule | File | When Referenced |
|------|------|-----------------|
| `partition-high-cardinality` | `partition-high-cardinality.md` | Hot partition detected |
| `partition-avoid-hotspots` | `partition-avoid-hotspots.md` | Hot partition detected |
| `partition-hierarchical` | `partition-hierarchical.md` | Partition skew detected |
| `partition-20gb-limit` | `partition-20gb-limit.md` | Large partition warning |

### Query Optimization (HIGH)
| Rule | File | When Referenced |
|------|------|-----------------|
| `query-avoid-cross-partition` | `query-avoid-cross-partition.md` | High RU queries |
| `query-use-projections` | `query-use-projections.md` | High RU queries |
| `query-pagination` | `query-pagination.md` | Timeout errors |

### SDK Best Practices (HIGH)
| Rule | File | When Referenced |
|------|------|-----------------|
| `sdk-singleton-client` | `sdk-singleton-client.md` | Connection issues |
| `sdk-connection-mode` | `sdk-connection-mode.md` | High latency |
| `sdk-retry-429` | `sdk-retry-429.md` | Throttling detected |
| `sdk-diagnostics` | `sdk-diagnostics.md` | Troubleshooting |

### Throughput & Scaling (MEDIUM)
| Rule | File | When Referenced |
|------|------|-----------------|
| `throughput-autoscale` | `throughput-autoscale.md` | Variable load throttling |
| `throughput-burst` | `throughput-burst.md` | Spike throttling |
| `throughput-right-size` | `throughput-right-size.md` | Over/under provisioned |

### Global Distribution (MEDIUM)
| Rule | File | When Referenced |
|------|------|-----------------|
| `global-zone-redundancy` | `global-zone-redundancy.md` | No zone redundancy |
| `global-multi-region` | `global-multi-region.md` | Single region |
| `global-failover` | `global-failover.md` | No auto-failover |
| `global-consistency` | `global-consistency.md` | Consistency issues |

### Monitoring & Diagnostics (LOW-MEDIUM)
| Rule | File | When Referenced |
|------|------|-----------------|
| `monitoring-throttling` | `monitoring-throttling.md` | 429 errors detected |
| `monitoring-latency` | `monitoring-latency.md` | High P99 latency |
| `monitoring-diagnostic-logs` | `monitoring-diagnostic-logs.md` | No diagnostics |
| `monitoring-azure-monitor` | `monitoring-azure-monitor.md` | No alerts configured |

---

*CosmosDBOps v1.1.0 | Powered by Azure MCP + cosmosdb-best-practices*
