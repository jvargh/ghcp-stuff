# K8sOps Skill - End-to-End Demo Runbook

This runbook exercises all K8sOps skill commands in a realistic incident response scenario.

---

## Scenario: Production Incident Response

**Situation**: You receive an alert that an application in your AKS cluster is experiencing issues. Walk through the complete incident response workflow using K8sOps.

---

## Prerequisites

```bash
# Ensure AKS MCP is configured
cat ~/.copilot/mcp-config.json | grep aks-mcp

# Ensure Azure CLI is authenticated
az account show

# Ensure at least one AKS cluster is running
az aks show -n aks01day2 -g aks01day2-rg --query powerState.code

# If stopped, start the cluster
az aks start -n aks01day2 -g aks01day2-rg
```

---

## Step 1: Quick Health Check (`/k8s status`)

**Purpose**: Get immediate visibility into cluster health.

```
/k8s status
```

**Expected Output (Healthy)**:
```
✅ All systems green | 3 nodes ready | 85 pods running | No issues
```

**Expected Output (Issues)**:
```
🚨 Issues detected

WHAT: pets/store-front (CrashLoopBackOff, 16 restarts)
WHY:  Container entrypoint overridden
FIX:  kubectl patch deployment store-front -n pets ...
```

**What it checks**:
- Cluster power state
- Node conditions (Ready, Pressure)
- Pod failures
- Warning events (last 1h)

---

## Step 2: Deep Diagnosis (`/k8s diagnose`)

**Purpose**: Get comprehensive root cause analysis when issues are detected.

```
/k8s diagnose aks01day2
```

**Expected Output**:
```
🔍 DIAGNOSIS: aks01day2

## Cluster Health
| Component | Status |
|-----------|--------|
| Power State | ✅ Running |
| K8s Version | 1.32.7 |
| Nodes | ✅ 3/3 Ready |
| Control Plane | ✅ No errors |

## Resource Utilization
| Node | CPU | Memory |
|------|-----|--------|
| aks-syspool-vmss00001z | 7% | 20% |
| aks-userpool-vmss00003k | 7% | 14% |
| aks-userpool-vmss00003l | 8% | 17% |

## Issues Detected (1)

### 🔴 CRITICAL: Pod CrashLoopBackOff

WHAT: pets/store-front-6f467b6cdf-dcsfn
      Status: CrashLoopBackOff (16 restarts)
      Exit Code: 1
      Node: aks-userpool-41046857-vmss00003l

WHY:  Deployment modified to inject crash command
      Evidence: args: ["echo forcing crash; exit 1"]
      Modified: 2025-10-02 (deployment revision 17)

FIX:  kubectl patch deployment store-front -n pets --type=json \
      -p='[{"op":"remove","path":"/spec/template/spec/containers/0/command"},
           {"op":"remove","path":"/spec/template/spec/containers/0/args"}]'
```

**What it analyzes**:
- Cluster configuration
- Node health and conditions
- Pod failures and restart patterns
- Events and their correlation
- Resource pressure

---

## Step 3: Get Pod Logs (`/k8s logs`)

**Purpose**: Retrieve logs from a specific pod for investigation.

```
/k8s logs store-front -n pets
```

**Expected Output**:
```
📋 LOGS: pets/store-front-6f467b6cdf-dcsfn (last 100 lines)

2026-01-24T22:12:06.316Z forcing crash

⚠️ Analysis: Container exits immediately after startup.
   The only log entry is "forcing crash" - indicates entrypoint override.
```

**With analysis flag**:
```
/k8s logs store-front -n pets --analyze
```

**Expected Output**:
```
📋 LOGS: pets/store-front (with analysis)

Log Entries: 1
Errors: 0
Warnings: 0
Exceptions: 0

🔍 ANALYSIS:
The container produces only one log line before exiting.
This is consistent with an entrypoint override that executes
"echo forcing crash; exit 1" instead of the application.

Root Cause: Deployment spec modification, not application error.
```

---

## Step 4: Aggregate Logs from All Sources (`/k8s logs --aggregate`)

**Purpose**: Correlate logs across infrastructure and applications to find causation chain.

```
/k8s logs --aggregate --timespan 1h
```

**Expected Output**:
```
📊 LOG AGGREGATION: aks01day2 (last 1h)

SOURCES:
- K8s Events: 47 entries
- App Logs: 1 entry (store-front)
- Container Logs (Log Analytics): 500 entries
- Control Plane: 0 errors

TIMELINE:
─────────────────────────────────────────────────────────────────────
21:09:00 [INFRA]   Cluster started (az aks start)
21:11:53 [EVENT]   TooManyMissedTimes - CronJob clock skew (expected after restart)
21:11:54 [EVENT]   FailedToUpdateEndpointSlices - Stale node references
21:14:40 [EVENT]   Scheduled: pets/store-front assigned to vmss00003l
21:14:51 [EVENT]   Pulled: Image ghcr.io/azure-samples/aks-store-demo/store-front
21:14:51 [EVENT]   Created: Container store-front
21:14:51 [EVENT]   Started: Container store-front
21:14:52 [APP]     store-front: "forcing crash"
21:14:52 [EVENT]   BackOff: Back-off restarting failed container
22:10:33 [APP]     makeline-service: "context deadline exceeded" (normal - no orders)
22:12:06 [APP]     store-front: "forcing crash" (restart #16)
─────────────────────────────────────────────────────────────────────

NODE METRICS:
| Node | CPU | Memory | Status |
|------|-----|--------|--------|
| vmss00001z | 7% | 20% | ✅ |
| vmss00003k | 7% | 14% | ✅ |
| vmss00003l | 8% | 17% | ✅ |

CONTROL PLANE:
✅ No errors in kube-apiserver, kube-scheduler, kube-controller-manager

─────────────────────────────────────────────────────────────────────

🔴 ROOT CAUSE: Application-level issue (not infrastructure)

WHAT: pets/store-front container crashes immediately on start
WHY:  Deployment entrypoint overridden with crash command
FIX:  Remove command/args override from deployment spec
```

**Log sources aggregated**:
- K8s Events (`call_kubectl`)
- Pod logs (`call_kubectl`)
- Container logs from Log Analytics (`az_monitoring`)
- Control plane logs (`az_monitoring`)
- Node metrics (`call_kubectl`)

---

## Step 5: Export Logs to Archive (`/k8s logs --export`)

**Purpose**: Create a ZIP archive for offline analysis or to attach to support cases.

```
/k8s logs --export --timespan 1h
```

**Expected Output**:
```
📦 EXPORTING LOGS: aks01day2

Collecting:
  ✅ K8s events (454 KB)
  ✅ Pod status (17 KB)
  ✅ Node status (1 KB)
  ✅ Node descriptions (38 KB)
  ✅ Node metrics (1 KB)
  ✅ Pod metrics (8 KB)
  ✅ Problem pod: store-front-describe.txt (5 KB)
  ✅ Problem pod: store-front-logs.txt (1 KB)
  ✅ Container logs from Log Analytics (186 KB)
  ✅ Cluster configuration (14 KB)
  ✅ Summary report (2 KB)

Creating archive...

✅ Archive created: ~/Desktop/aks-logs-2026-01-24-223500.zip (52 KB)

Contents:
- SUMMARY.md
- events.txt
- pods.txt
- nodes.txt
- nodes-describe.txt
- node-metrics.txt
- pod-metrics.txt
- store-front-describe.txt
- store-front-logs.txt
- container-logs.json
- cluster-info.json
```

**Archive location**: `~/Desktop/aks-logs-YYYY-MM-DD-HHMMSS.zip`

---

## Step 6: Generate Support Case Template (`/k8s case`)

**Purpose**: Create a pre-filled support case document ready for Microsoft Support or internal escalation.

```
/k8s case aks01day2
```

**Expected Output**:
```
📋 GENERATING SUPPORT CASE TEMPLATE: aks01day2

Collecting Azure context...
Collecting cluster details...
Running diagnosis...
Gathering evidence...

✅ Case template created: ~/Desktop/AKS-Support-Case-aks01day2-2026-01-24-223600.md
```

**Generated Case Template**:
```markdown
# Azure Support Case - AKS Incident

## Case Summary
| Field | Value |
|-------|-------|
| **Title** | AKS Pod CrashLoopBackOff - pets/store-front |
| **Severity** | 🔴 Critical |
| **Problem Start Time** | 2026-01-24T21:14:52Z |
| **Current Status** | Ongoing |

## Azure Context
| Field | Value |
|-------|-------|
| **Subscription ID** | 463a82d4-1896-4332-aeeb-618ee5a5aa93 |
| **Subscription Name** | ME-MngEnvMCAP993834-varghesejoji-1 |
| **Tenant ID** | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| **Resource Group** | aks01day2-rg |
| **Resource URI** | /subscriptions/463a82d4-.../managedClusters/aks01day2 |

## Cluster Details
| Field | Value |
|-------|-------|
| **Cluster Name** | aks01day2 |
| **FQDN** | aks01day2-dns-ddyhpmop.hcp.centralus.azmk8s.io |
| **Kubernetes Version** | 1.32.7 |
| **Region** | centralus |
| **Node Resource Group** | MC_aks01day2_centralus |

## Problem Description

Pod `store-front` in namespace `pets` is in CrashLoopBackOff state with 16+ 
restarts. Container exits immediately with code 1 after startup. The only 
log output is "forcing crash".

## Affected Resources

| Type | Name | Namespace | Status |
|------|------|-----------|--------|
| Pod | store-front-6f467b6cdf-dcsfn | pets | CrashLoopBackOff |
| Deployment | store-front | pets | 1/2 available |
| Service | store-front | pets | Degraded |

## Initial Triage Outcomes

| Check | Result |
|-------|--------|
| Cluster Power State | ✅ Running |
| Node Health | ✅ 3/3 Ready |
| Node Resources | ✅ CPU 7%, Memory 17% |
| Control Plane | ✅ No errors |
| Pod Status | ❌ 1 CrashLoopBackOff |
| Events | ⚠️ BackOff events for store-front |

## Suggested Root Cause

**Deployment modification injected crash command**

The deployment spec was modified to override the container entrypoint:
```yaml
command: ["/bin/sh", "-c"]
args: ["echo forcing crash; exit 1"]
```

This is NOT an AKS infrastructure issue. The deployment was intentionally 
or accidentally modified (revision 17, last changed 2025-10-02).

## Evidence Summary

| Timestamp | Source | Entry |
|-----------|--------|-------|
| 21:14:40Z | Event | Scheduled: Assigned to aks-userpool-vmss00003l |
| 21:14:51Z | Event | Pulled: Image store-front:latest (10.1s) |
| 21:14:51Z | Event | Created: Container store-front |
| 21:14:51Z | Event | Started: Container store-front |
| 21:14:52Z | Log | "forcing crash" |
| 21:14:52Z | Event | BackOff: Back-off restarting failed container |

## Business Impact

[To be filled by user]
- Impact to end users: ___
- Revenue impact: ___
- SLA implications: ___

## Workaround Available

✅ Yes - Remove the command/args override from deployment spec.

## Remediation Attempted

- [ ] None yet
- [ ] Restarted pod
- [ ] Restarted deployment
- [ ] Other: ___

## Recommended Fix

```bash
kubectl patch deployment store-front -n pets --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/containers/0/command"},
       {"op":"remove","path":"/spec/template/spec/containers/0/args"}]'
```

## Attachments

- [ ] Log archive: `aks-logs-2026-01-24-223500.zip`

---
*Generated by K8sOps v2.4.0 | 2026-01-24T22:36:00Z*
```

---

## Step 7: Apply Fix (`/k8s fix`)

**Purpose**: Apply the recommended remediation.

```
/k8s fix store-front-crashloop
```

**Expected Output**:
```
🔧 APPLYING FIX: store-front-crashloop

Issue: Pod CrashLoopBackOff - pets/store-front
Fix: Remove command/args override from deployment

Executing:
  kubectl patch deployment store-front -n pets --type=json \
    -p='[{"op":"remove","path":"/spec/template/spec/containers/0/command"},
         {"op":"remove","path":"/spec/template/spec/containers/0/args"}]'

✅ Deployment patched successfully

Verifying fix...
  New pod: store-front-7a8b9c0d1e-xyz12 (Running)
  Restarts: 0
  Status: ✅ Healthy

🎉 Issue resolved. Run `/k8s status` to confirm.
```

---

## Step 8: Verify Resolution (`/k8s status`)

**Purpose**: Confirm the issue is resolved.

```
/k8s status
```

**Expected Output**:
```
✅ All systems green | 3 nodes ready | 85 pods running | No issues
```

---

## Complete Workflow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     K8sOps INCIDENT RESPONSE WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

  ALERT RECEIVED
       │
       ▼
  ┌─────────────────┐
  │ /k8s status     │  ◄── Quick health check (< 10 sec)
  └────────┬────────┘
           │
           ▼ Issues found?
           │
    Yes ───┴─── No ──► Done ✅
           │
           ▼
  ┌─────────────────┐
  │ /k8s diagnose   │  ◄── Deep root cause analysis
  └────────┬────────┘
           │
           ▼ Need more context?
           │
    Yes ───┴─── No
           │      │
           ▼      │
  ┌─────────────────┐    │
  │ /k8s logs       │    │
  │ --aggregate     │  ◄─┼── Correlated timeline
  └────────┬────────┘    │
           │             │
           ▼             │
  ┌─────────────────┐    │
  │ /k8s logs       │    │
  │ --export        │  ◄─┼── Archive for analysis
  └────────┬────────┘    │
           │             │
           ▼ Need support case?
           │             │
    Yes ───┴─── No ◄─────┘
           │      │
           ▼      │
  ┌─────────────────┐    │
  │ /k8s case       │  ◄─┼── Support case template
  └────────┬────────┘    │
           │             │
           ▼◄────────────┘
  ┌─────────────────┐
  │ /k8s fix        │  ◄── Apply remediation
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ /k8s status     │  ◄── Verify resolution
  └────────┬────────┘
           │
           ▼
        Done ✅
```

---

## Command Quick Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `/k8s status` | Quick health check | Green/Red status |
| `/k8s diagnose [cluster]` | Deep root cause | Detailed report |
| `/k8s logs <pod> [-n ns]` | Pod logs | Log content + analysis |
| `/k8s logs --aggregate` | Multi-source correlation | Timeline |
| `/k8s logs --export` | Export for support | ZIP archive |
| `/k8s case [cluster]` | Support case template | Markdown file |
| `/k8s fix <issue-id>` | Apply remediation | Execution + verify |

---

## Time Estimates

| Step | Typical Duration |
|------|------------------|
| Status check | 5-10 seconds |
| Diagnosis | 15-30 seconds |
| Log retrieval | 5-15 seconds |
| Log aggregation | 30-60 seconds |
| Log export | 30-60 seconds |
| Case generation | 15-30 seconds |
| Fix application | 10-30 seconds |
| **Total incident response** | **2-5 minutes** |

---

*K8sOps Demo Runbook v2.4.0*
