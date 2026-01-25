# AppsOps Demo Runbook

A step-by-step guide to demonstrate AppsOps capabilities for Azure App Services incident response.

## Prerequisites

1. **GitHub Copilot CLI** installed
2. **Azure CLI** authenticated (`az login`)
3. **Azure MCP Server** configured
4. **AppsOps skill** installed at `~/.copilot/skills/AppsOps/`
5. At least one Web App or Function App in your subscription

## Setup Verification

```bash
# 1. Verify Azure CLI authentication
az account show

# 2. Reload skills in Copilot CLI
/skills reload

# 3. Verify AppsOps is loaded
/help apps
```

---

## Demo Scenarios

### Scenario 1: Quick Health Check

**Goal**: Get a quick overview of all App Services health.

```bash
# Check status of all apps
/apps status
```

**Expected Output (Healthy):**
```
✅ All systems green | 5 Web Apps | 3 Function Apps | No issues
```

**Expected Output (Issues):**
```
🚨 2 issues detected

1. myapp-prod: HTTP 500 errors (15% of requests)
2. func-processor: High memory (92%)

Run '/apps diagnose <app-name>' for details.
```

---

### Scenario 2: Deep Diagnosis

**Goal**: Investigate a specific app with issues.

```bash
# Diagnose a specific Web App
/apps diagnose myapp-prod
```

**Expected Output:**
```
🚨 ISSUE: HTTP 500 Error Spike

WHAT: myapp-prod returning 500 errors (15% of requests since 14:30 UTC)

WHY:  Database connection pool exhausted
      - SqlException: "Timeout expired. The timeout period elapsed..."
      - Concurrent connections: 100/100 (max pool size)
      - Started after deployment at 14:25 UTC

FIX:  Option 1 - Restart to clear pool:
      az webapp restart -n myapp-prod -g myapp-rg

      Option 2 - Scale out to distribute load:
      az webapp scale -n myapp-prod -g myapp-rg --instance-count 5

      Option 3 - Increase connection pool (app setting):
      az webapp config appsettings set -n myapp-prod -g myapp-rg \
        --settings "ConnectionStrings__Default=...;Max Pool Size=200"
```

---

### Scenario 3: Log Analysis

**Goal**: Analyze application logs for errors.

```bash
# Get recent logs with analysis
/apps logs myapp-prod --timespan 1h
```

**Expected Output:**
```
📋 APP LOGS: myapp-prod (last 1h)

ERROR SUMMARY:
─────────────────────────────────────────────────────
| Exception Type          | Count | First Seen      |
|-------------------------|-------|-----------------|
| SqlException            | 247   | 14:30:15 UTC    |
| TimeoutException        | 89    | 14:31:02 UTC    |
| NullReferenceException  | 3     | 14:45:30 UTC    |
─────────────────────────────────────────────────────

TOP ERRORS:
14:30:15 [ERROR] SqlException: Timeout expired. The timeout period 
         elapsed prior to obtaining a connection from the pool.
14:30:16 [ERROR] SqlException: Timeout expired...
14:31:02 [ERROR] TimeoutException: The operation has timed out.

🔴 ROOT CAUSE: Connection pool exhaustion correlates with deployment 
   at 14:25 UTC. New code may have connection leaks.
```

---

### Scenario 4: Log Aggregation

**Goal**: Correlate logs from multiple sources.

```bash
# Aggregate logs from all sources
/apps logs --aggregate --timespan 1h
```

**Expected Output:**
```
📊 LOG AGGREGATION: myapp-prod (last 1h)

SOURCES:
- Application Logs (stdout/stderr)
- Platform Logs (HTTP/IIS)
- Deployment Logs
- Activity Log
- Metrics

TIMELINE:
─────────────────────────────────────────────────────────────
14:25:00 [DEPLOY]    Deployment started by deploy@contoso.com
14:25:45 [DEPLOY]    Deployment completed (build: abc123)
14:25:50 [PLATFORM]  Application pool recycled
14:26:00 [APP]       Application started successfully
14:30:15 [APP]       SqlException: Timeout expired
14:30:16 [METRIC]    HTTP 5xx count: 12 (was 0)
14:30:30 [PLATFORM]  W3SVC: Request timeout
14:35:00 [METRIC]    CPU: 78%, Memory: 65%
─────────────────────────────────────────────────────────────

🔴 ROOT CAUSE: Deployment at 14:25 introduced connection pool issue.
   Errors started 5 minutes after deployment.

WHAT: myapp-prod HTTP 500 errors
WHY:  Connection pool exhaustion after deployment abc123
FIX:  az webapp restart -n myapp-prod -g myapp-rg
```

---

### Scenario 5: Support Case Generation

**Goal**: Generate a pre-filled support case for escalation.

```bash
# Generate support case template
/apps case myapp-prod
```

**Expected Output:**
```
📝 Support case template generated:
   ~/Desktop/AppService-Support-Case-myapp-prod-20260125-143000.md

Case Summary:
- Title: Web App HTTP 500 - myapp-prod
- Severity: 🔴 Critical
- Root Cause: Database connection pool exhaustion
- Evidence: 247 SqlExceptions in last hour
```

---

### Scenario 6: Log Export

**Goal**: Export all diagnostics for offline analysis.

```bash
# Export logs to ZIP archive
/apps logs --export --timespan 2h
```

**Expected Output:**
```
📦 Log export complete:
   ~/Desktop/appservice-logs-20260125-143500.zip

Contents:
- SUMMARY.md (issue analysis)
- app-config.json
- app-settings.json (secrets redacted)
- app-logs.txt (1,247 entries)
- platform-logs.txt (892 entries)
- metrics.json (CPU, Memory, HTTP errors)
- deployment-logs.txt
- plan-config.json

Total size: 2.4 MB
```

---

### Scenario 7: Quick Remediation

**Goal**: Apply a quick fix to restore service.

```bash
# Restart the app
/apps restart myapp-prod
```

**Expected Output:**
```
✅ Restart initiated: myapp-prod

Status:
- Restart command sent at 14:35:00 UTC
- App state: Restarting...
- Expected recovery: ~30 seconds

Monitoring... ✅ App is now Running
HTTP check: ✅ 200 OK (response time: 245ms)
```

---

### Scenario 8: Scale Operations

**Goal**: Scale out to handle increased load.

```bash
# Scale out the app
/apps scale myapp-prod --instances 5
```

**Expected Output:**
```
✅ Scaling initiated: myapp-prod

Current: 3 instances
Target:  5 instances
Plan:    myapp-plan (P1v3)

Status: Provisioning 2 new instances...
        ✅ Instance 4 ready
        ✅ Instance 5 ready

All 5 instances healthy and serving traffic.
```

---

### Scenario 9: Function App Diagnosis

**Goal**: Diagnose a Function App with cold start issues.

```bash
# Diagnose Function App
/apps diagnose func-processor
```

**Expected Output:**
```
🚨 ISSUE: High Cold Start Latency

WHAT: func-processor cold starts taking 8-12 seconds

WHY:  - Plan: Consumption (Y1) - cold starts expected
      - Package size: 245 MB (large)
      - Dependencies: 47 NuGet packages
      - No warm-up configured

FIX:  Option 1 - Enable Always On (requires Premium/Dedicated):
      az functionapp config set -n func-processor -g func-rg --always-on true

      Option 2 - Reduce package size:
      - Remove unused dependencies
      - Enable ReadyToRun compilation

      Option 3 - Upgrade to Premium plan:
      az functionapp plan create -n func-premium-plan -g func-rg \
        --sku EP1 --is-linux
```

---

### Scenario 10: Slot Operations

**Goal**: Check and manage deployment slots.

```bash
# List slots
/apps slots list myapp-prod
```

**Expected Output:**
```
📋 DEPLOYMENT SLOTS: myapp-prod

| Slot        | Status  | Traffic % | Last Deploy      |
|-------------|---------|-----------|------------------|
| production  | Running | 100%      | 2026-01-25 14:25 |
| staging     | Running | 0%        | 2026-01-25 10:00 |
| dev         | Stopped | 0%        | 2026-01-20 09:15 |

Swap history (last 7 days):
- 2026-01-24: staging → production (by admin@contoso.com)
- 2026-01-22: staging → production (by deploy@contoso.com)
```

---

## Troubleshooting

### "No apps found"
```bash
# Verify Azure subscription
az account show

# List apps manually
az webapp list -o table
```

### "Permission denied"
```bash
# Check RBAC role
az role assignment list --assignee $(az account show --query user.name -o tsv)
```

### "Azure MCP not responding"
```bash
# Verify MCP configuration
cat ~/.copilot/mcp-config.json

# Test Azure CLI directly
az webapp list -o table
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/apps status` | Health check all apps |
| `/apps diagnose <app>` | Deep diagnosis |
| `/apps logs <app>` | View app logs |
| `/apps logs --aggregate` | Correlated timeline |
| `/apps logs --export` | Export to ZIP |
| `/apps case <app>` | Generate support case |
| `/apps restart <app>` | Restart app |
| `/apps scale <app> --instances N` | Scale out/in |
| `/apps slots list <app>` | List deployment slots |
| `/apps functions list <app>` | List functions |

---

*AppsOps v1.0.0 | Demo Runbook*
