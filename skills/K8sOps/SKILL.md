---
name: K8sOps
description: AKS operational intelligence agent for Azure Kubernetes Service. Monitor cluster health, diagnose issues, analyze logs, and get AI-powered remediation guidance across your subscription.
version: 1.0.0
---

# K8sOps - AKS Operations Intelligence Agent

An AI-powered operational assistant for Azure Kubernetes Service (AKS) clusters. Get real-time health insights, issue diagnosis, and remediation guidance through natural language commands.

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- kubectl installed
- Access to AKS clusters in your subscription
- Log Analytics workspace connected (for log analysis features)

## Commands

### `/k8s health [cluster|all]`

Get a quick health overview of your AKS cluster(s).

**Usage:**
- `/k8s health` - Health of current context cluster
- `/k8s health aks01day2` - Health of specific cluster
- `/k8s health all` - Health summary of all clusters

**What it checks:**
- Cluster provisioning state and Kubernetes version
- Node status and conditions (Ready, MemoryPressure, DiskPressure)
- Pod status summary (Running, Pending, Failed, CrashLoopBackOff)
- Resource utilization (CPU/Memory) if metrics available

---

### `/k8s events [cluster] [--namespace ns] [--severity warning|error]`

Surface recent Kubernetes events, filtered by severity.

**Usage:**
- `/k8s events` - All recent events from current cluster
- `/k8s events aks01day2` - Events from specific cluster
- `/k8s events --namespace default` - Events from specific namespace
- `/k8s events --severity error` - Only error-level events

**What it shows:**
- Warning and Error events from the last hour
- Event source, object, and message
- Timestamp and occurrence count

---

### `/k8s pods [cluster] [--issues-only] [--namespace ns]`

View pod status with automatic issue detection.

**Usage:**
- `/k8s pods` - All pods from current cluster
- `/k8s pods --issues-only` - Only problematic pods
- `/k8s pods --namespace kube-system` - Pods in specific namespace

**Issue detection:**
- CrashLoopBackOff (restart loops)
- ImagePullBackOff (registry/image issues)
- Pending (scheduling failures)
- OOMKilled (memory issues)
- Failed containers

---

### `/k8s logs [pod] [--namespace ns] [--tail n] [--analyze]`

Fetch pod logs with optional AI-powered analysis.

**Usage:**
- `/k8s logs my-pod` - Last 100 lines from pod
- `/k8s logs my-pod --tail 500` - Last 500 lines
- `/k8s logs my-pod --analyze` - Analyze logs for errors/patterns

**With --analyze:**
- Error pattern detection and grouping
- Stack trace extraction
- Root cause suggestions
- Remediation recommendations

---

### `/k8s diagnose [cluster]`

Comprehensive AI-powered cluster diagnosis.

**Usage:**
- `/k8s diagnose` - Diagnose current cluster
- `/k8s diagnose aks01day2` - Diagnose specific cluster

**What it analyzes:**
- Node health and resource pressure
- Pod failures and restart patterns
- Recent events and their correlation
- Resource constraints and scheduling issues

**Output includes:**
- Prioritized issue list (Critical, High, Medium, Low)
- Root cause analysis for each issue
- Step-by-step remediation commands
- Prevention recommendations

---

### `/k8s alerts [cluster|all]`

Show active Azure Monitor alerts for AKS clusters.

**Usage:**
- `/k8s alerts` - Alerts for current cluster
- `/k8s alerts all` - Alerts across all clusters

**Alert sources:**
- Azure Monitor metric alerts
- Log Analytics query alerts
- Container Insights alerts

---

## Workflow

When invoked, this skill will:

1. **Discover clusters** - List AKS clusters in the subscription using `az aks list`
2. **Get credentials** - Obtain kubectl access with `az aks get-credentials`
3. **Collect data** - Run kubectl commands and Azure CLI queries
4. **Analyze** - Process data to identify issues and patterns
5. **Report** - Present findings with actionable remediation steps

## Data Sources

| Source | Commands Used | Data Retrieved |
|--------|---------------|----------------|
| Azure CLI | `az aks show`, `az aks list` | Cluster state, version, config |
| kubectl | `get nodes`, `get pods`, `get events` | K8s object status |
| kubectl | `describe`, `logs`, `top` | Detailed diagnostics |
| Log Analytics | KQL queries | Historical logs, metrics |

## Example Session

```
User: /k8s health all

K8sOps: Checking health of 3 AKS clusters...

## Cluster Health Summary

| Cluster | Status | Nodes | Pods | Issues |
|---------|--------|-------|------|--------|
| aks01day2 | ⚠️ Warning | 2/3 Ready | 45/48 Running | 3 |
| aks02day2 | ✅ Healthy | 3/3 Ready | 32/32 Running | 0 |
| aksnapday2 | ✅ Healthy | 2/2 Ready | 18/18 Running | 0 |

### aks01day2 Issues:
1. **Node NotReady** - `aks-nodepool1-vmss000002` has MemoryPressure
2. **CrashLoopBackOff** - `app-backend-7d9f8c` (12 restarts)
3. **Pending** - `ml-job-xyz` waiting for resources

Run `/k8s diagnose aks01day2` for detailed analysis.
```

## Troubleshooting

### "Unable to connect to server"
- Check if cluster is running: `az aks show -n <cluster> -g <rg> --query powerState`
- Start stopped cluster: `az aks start -n <cluster> -g <rg>`

### "Unauthorized" errors
- Re-authenticate: `az login`
- Refresh credentials: `az aks get-credentials -n <cluster> -g <rg> --overwrite-existing`

### Missing metrics
- Ensure Container Insights is enabled on the cluster
- Check Log Analytics workspace connection

---

*K8sOps v1.0.0 | AKS Operations Intelligence*
