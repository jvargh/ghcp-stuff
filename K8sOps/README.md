# Building K8sOps: An AKS Incident Response Skill with GitHub Copilot SDK, CLI, and AKS MCP

##### *How I built K8sOps by combining the Copilot extensibility stack to turn natural language into Kubernetes operational intelligence*

---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Quick Setup](#quick-setup)
   - [Prompts Used to Create K8sOps](#prompts-used-to-create-k8sops)
2. [Introduction](#introduction)
3. [Layer 1: GitHub Copilot SDK (The Extensibility Foundation)](#layer-1-github-copilot-sdk--the-extensibility-foundation)
4. [Layer 2: GitHub Copilot CLI (The User Interface)](#layer-2-github-copilot-cli--the-user-interface)
5. [Layer 3: AKS Model Context Protocol (MCP) Server](#layer-3-aks-model-context-protocol-mcp-server)
6. [Bringing It Together: K8sOps Skill](#bringing-it-together-k8sops-skill)
7. [Key Features Deep Dive](#key-features-deep-dive)
8. [SDK + CLI + MCP: The Power of Integration](#sdk--cli--mcp-the-power-of-integration)
9. [Real-World Incident Response](#real-world-incident-response)
10. [Lessons Learned](#lessons-learned)
11. [Conclusion](#conclusion)
12. [Architecture](#architecture)
13. [Demo Runbook](#demo-runbook)
14. [Resources](#resources)

---

## Getting Started

### Prerequisites

1. **GitHub Copilot CLI**  -  Install from GitHub
2. **Azure CLI**  -  Authenticated (`az login`)
3. **AKS MCP Server**  -  Downloaded and configured
4. **K8sOps Skill**  -  Installed in skills directory

### Quick Setup

```bash
# 1. Install AKS MCP
mkdir -p ~/.aks-mcp
curl -L https://github.com/Azure/aks-mcp/releases/latest/download/aks-mcp-linux-amd64 -o ~/.aks-mcp/aks-mcp
chmod +x ~/.aks-mcp/aks-mcp

# 2. Configure MCP (add to ~/.copilot/mcp-config.json)

# 3. Install K8sOps skill
mkdir -p ~/.copilot/skills/K8sOps
# Download SKILL.md from repo

# 4. Reload and test
/skills reload
/k8s status
```

### Prompts Used to Create K8sOps

The following prompts were used iteratively in GitHub Copilot CLI to build the K8sOps skill. You can use these same prompts to recreate or customize the skill for your environment.

#### Prompt 1: Initial Skill Creation

```
Create a K8sOps skill that has first hand info on anything going wrong in AKS 
deployments on my subscription. The skill should be able to check cluster health, 
get pod status, retrieve events, and diagnose issues.
```

#### Prompt 2: Adding Response Behavior

```
Modify the skill to provide a detailed report on cause and effect when tools are 
run, only if there's a negative anomaly reported. Otherwise just report that all 
systems green.
```

#### Prompt 3: Integrating AKS MCP

```
Rework the skill to use the AKS MCP for all its attributes. Map each command to 
the appropriate MCP tool (call_az, call_kubectl, az_monitoring, run_detector).
```

#### Prompt 4: Simplifying for Reactive Scenarios

```
Simplify the attributes so it's easier to get to the root cause in reactive 
scenarios. Use format: WHAT (resource and state), WHY (root cause with evidence), 
FIX (exact command to resolve).
```

#### Prompt 5: Adding Log Aggregation

```
Add the ability to aggregate logs from infra and apps. Correlate logs from 
K8s events, pod logs, container logs from Log Analytics, and control plane 
logs into a unified timeline.
```

#### Prompt 6: Adding Log Export

```
Add a feature to download logs in an archived format. Create a ZIP file 
containing all diagnostic data (events, pods, nodes, metrics, logs, cluster 
config) with a summary report.
```

#### Prompt 7: Adding Support Case Template

```
Create an attribute that generates a case template containing: Title, Description, 
Problem start time, subscription id, subscription name, tenant id, resource uri, 
initial triage outcomes, suggested root cause. Add additional relevant fields.
```

#### Key Principles for Skill Prompting

1. **Start simple** - Begin with core functionality, then iterate
2. **Be specific about output format** - Describe exactly how you want responses structured
3. **Reference MCP tools explicitly** - Tell the AI which tools to use for which operations
4. **Iterate based on usage** - Run the skill, identify gaps, prompt for improvements

The skill definition is automatically created at `~/.copilot/skills/K8sOps/SKILL.md`. You can manually edit this file to further customize behavior.

---

## Introduction

Managing Azure Kubernetes Service (AKS) clusters at scale is complex. When incidents occur, engineers often find themselves jumping between multiple tools  -  `kubectl`, Azure CLI, Log Analytics, Azure Monitor  -  piecing together information to identify root causes.

What if you could simply ask: *"What's wrong with my cluster?"* and get an intelligent, correlated response with actionable remediation steps?

This is exactly what I built with **K8sOps**  -  an AI-powered incident response skill that leverages the full GitHub Copilot extensibility stack:

- **GitHub Copilot SDK**  -  The foundation for building Copilot extensions
- **GitHub Copilot CLI**  -  The terminal interface that executes skills
- **AKS MCP Server**  -  The bridge to Azure and Kubernetes APIs

In this post, I'll walk through each layer of the architecture and how they work together.

---

## Layer 1: GitHub Copilot SDK  (The Extensibility Foundation)

### What is the GitHub Copilot SDK?

The GitHub Copilot SDK is the programmatic foundation that enables developers to extend Copilot's capabilities. It provides:

- **Extension APIs**  -  Build custom Copilot extensions that integrate with the AI
- **Model Context Protocol (MCP)**  -  A standardized way to connect AI to external systems
- **Skill Definitions**  -  A declarative format for encoding domain expertise
- **Tool Invocation**  -  Programmatic access to execute tools and interpret results

### The Extensibility Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB COPILOT SDK                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │
│   │   Extension     │   │   Model Context │   │   Skill         │       │
│   │   APIs          │   │   Protocol      │   │   Definitions   │       │
│   │                 │   │   (MCP)         │   │                 │       │
│   │ * Register      │   │                 │   │ * SKILL.md      │       │
│   │   extensions    │   │ * Tool schemas  │   │ * Commands      │       │
│   │ * Handle        │   │ * Server config │   │ * Behaviors     │       │
│   │   requests      │   │ * Invocation    │   │ * Tool mapping  │       │
│   │ * Return        │   │   protocol      │   │                 │       │
│   │   responses     │   │                 │   │                 │       │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why the SDK Matters

The SDK enables three key capabilities that K8sOps relies on:

1. **MCP Server Integration**  -  Connect to external systems (Azure, Kubernetes) through a standardized protocol
2. **Skill Loading**  -  Define reusable, shareable domain expertise in markdown
3. **Tool Orchestration**  -  Chain multiple tool calls to accomplish complex tasks

Without the SDK, you'd need to build all this infrastructure yourself. With it, you focus on the *domain logic*  -  not the *plumbing*.

---

## Layer 2: GitHub Copilot CLI  (The User Interface)

### What is GitHub Copilot CLI?

GitHub Copilot CLI is the terminal-based interface built on the Copilot SDK. It brings AI assistance directly to where developers work  -  the command line.

Key capabilities:

- **Conversational Interface**  -  Ask questions in natural language
- **Command Execution**  -  Run shell commands and interpret results
- **MCP Integration**  -  Access configured MCP servers and their tools
- **Skill System**  -  Load and invoke custom skills via `/command` syntax

### The CLI as Skill Runtime

The CLI acts as the runtime for skills defined using the SDK:

```
User Input          CLI Processing           Skill Execution
───────────        ────────────────         ────────────────
           
/k8s status   ──->  Match to K8sOps    ──->  Read SKILL.md
                   skill                    Parse commands
                                            Invoke MCP tools
                                            Format response
                                                 │
                                                 v
                                           Return to user
```

### Skills Directory Structure

Skills are loaded from `~/.copilot/skills/`:

```
~/.copilot/
├── mcp-config.json          # MCP server configuration
└── skills/
    └── K8sOps/
        ├── SKILL.md         # Skill definition (SDK format)
        ├── VERSION          # Version tracking
        ├── ARCHITECTURE.md  # Documentation
        └── DEMO-RUNBOOK.md  # Usage examples
```

### The SKILL.md Format

The skill definition follows the SDK's declarative format:

```yaml
---
name: K8sOps
description: AKS incident response agent
version: 2.4.0
mcp_servers:
  - aks-mcp          # Declares MCP dependency
---

# K8sOps - AKS Incident Response Agent

## Commands

### `/k8s status`
Quick health check. Returns green or identifies issues.

## MCP Tools Used

| Action | MCP Call |
|--------|----------|
| List clusters | `call_az` -> `az aks list` |
| Node status | `call_kubectl` -> `get nodes` |
```

The SDK interprets this markdown to:

1. Register the `/k8s` command namespace
2. Load the required MCP servers
3. Map commands to tool invocations
4. Apply the specified response behaviors

---

## Layer 3: AKS Model Context Protocol (MCP) Server

### What is MCP?

The Model Context Protocol is a specification within the Copilot SDK that standardizes how AI assistants interact with external systems. It defines:

- **Tool Schemas**  -  What operations are available
- **Invocation Protocol**  -  How to call tools and receive responses
- **Transport Mechanisms**  -  stdio, HTTP, WebSocket

### AKS MCP Server

Microsoft provides an official [AKS MCP server](https://github.com/Azure/aks-mcp) that implements the MCP specification for Azure Kubernetes Service:

| Tool                          | Purpose             | Example                          |
| ----------------------------- | ------------------- | -------------------------------- |
| `call_az`                   | Execute Azure CLI   | `az aks list`, `az aks show` |
| `call_kubectl`              | Execute kubectl     | `get pods`, `describe node`  |
| `az_monitoring`             | Query Log Analytics | KQL on ContainerLogV2            |
| `run_detector`              | AKS diagnostics     | Node health, connectivity        |
| `az_network_resources`      | Network info        | VNet, NSG, routes                |
| `az_advisor_recommendation` | Azure Advisor       | Cost, security, performance      |

### Installing AKS MCP

```powershell
# Download the binary (Windows)
$aksPath = "$env:USERPROFILE\.aks-mcp"
mkdir $aksPath -Force
Invoke-WebRequest -Uri "https://github.com/Azure/aks-mcp/releases/latest/download/aks-mcp-windows-amd64.exe" `
  -OutFile "$aksPath\aks-mcp.exe"

# Verify
& "$aksPath\aks-mcp.exe" --version
# aks-mcp version 0.0.12
```

### Configuring MCP in the SDK

The CLI loads MCP servers from `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "aks-mcp": {
      "type": "stdio",
      "command": "C:\\Users\\you\\.aks-mcp\\aks-mcp.exe",
      "args": ["--transport", "stdio", "--access-level", "readwrite"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "463a82d4-1896-4332-aeeb-618ee5a5aa93"
      },
      "tools": ["*"]
    }
  }
}
```

This configuration tells the SDK:

- **Server name**: `aks-mcp` (referenced in SKILL.md)
- **Transport**: stdio (standard input/output)
- **Binary path**: Where to find the MCP server
- **Access level**: readwrite (allows mutations)
- **Tools**: `*` (all tools enabled)

---

## Bringing It Together: K8sOps Skill

### The Complete Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER                                       │
│                         "/k8s diagnose"                                 │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  v
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB COPILOT CLI                               │
│                    (Built on Copilot SDK)                               │
│                                                                         │
│   * Parses user input                                                   │
│   * Matches to K8sOps skill                                             │
│   * Loads SKILL.md definition                                           │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  v
┌─────────────────────────────────────────────────────────────────────────┐
│                         K8sOps SKILL                                    │
│                 ~/.copilot/skills/K8sOps/SKILL.md                       │
│                                                                         │
│   * Defines /k8s commands                                               │
│   * Specifies response behavior (green/red model)                       │
│   * Maps operations to MCP tools                                        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  v
┌─────────────────────────────────────────────────────────────────────────┐
│                    AKS MCP SERVER (via SDK)                             │
│                     ~/.aks-mcp/aks-mcp.exe                              │
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │  call_az    │  │call_kubectl │  │az_monitoring│  │run_detector │    │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│          │                │                │                │           │
└──────────┼────────────────┼────────────────┼────────────────┼───────────┘
           │                │                │                │
           v                v                v                v
    ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
    │ Azure ARM  │   │ Kubernetes │   │    Log     │   │    AKS     │
    │    API     │   │ API Server │   │ Analytics  │   │ Detectors  │
    └────────────┘   └────────────┘   └────────────┘   └────────────┘
```

### Design Philosophy

K8sOps was designed around three principles:

1. **Green Light / Red Light**  -  Don't overwhelm with data when everything is healthy
2. **Root Cause First**  -  When issues exist, lead with the "why" not just the "what"
3. **Actionable Output**  -  Every issue includes a fix command

### Response Model

```
┌─────────────────────────────────────────────────────────┐
│                    ALL HEALTHY                          │
│                                                         │
│  [OK] All systems green | 3 nodes | 85 pods | No issues │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   ISSUES DETECTED                       │
│                                                         │
│  [ALERT] ISSUE: Pod CrashLoopBackOff                    │
│                                                         │
│  WHAT: pets/store-front (16 restarts, exit code 1)      │
│  WHY:  Container entrypoint overridden with crash cmd   │
│  FIX:  kubectl patch deployment store-front -n pets ... │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Commands

| Command                     | Purpose                              |
| --------------------------- | ------------------------------------ |
| `/k8s status`             | Quick health check                   |
| `/k8s diagnose [cluster]` | Deep root cause analysis             |
| `/k8s logs <pod>`         | Pod logs with analysis               |
| `/k8s logs --aggregate`   | Correlated timeline from all sources |
| `/k8s logs --export`      | ZIP archive for support              |
| `/k8s case [cluster]`     | Generate support case template       |
| `/k8s fix <issue-id>`     | Apply remediation                    |

---

## Key Features Deep Dive

### 1. Log Aggregation

The `/k8s logs --aggregate` command demonstrates the power of the SDK's tool orchestration  -  it invokes multiple MCP tools in parallel and correlates the results:

```
[DATA] LOG AGGREGATION: aks01day2 (last 1h)

SOURCES:
- K8s Events (call_kubectl)
- App Logs (call_kubectl)
- Container Logs (az_monitoring -> KQL)
- Control Plane (az_monitoring -> AzureDiagnostics)

TIMELINE:
─────────────────────────────────────────────────────────────
21:14:40 [EVENT]    Scheduled: pets/store-front -> vmss00003l
21:14:51 [EVENT]    Started: Container store-front
21:14:52 [APP]      store-front: "forcing crash"
21:14:52 [EVENT]    BackOff: Back-off restarting container
─────────────────────────────────────────────────────────────

[CRITICAL] ROOT CAUSE: Container entrypoint overridden with crash command
```

### 2. Support Case Generation

The `/k8s case` command generates a complete support case by orchestrating:

- `call_az` -> Azure context (subscription, tenant, resource URI)
- `call_az` -> Cluster details (version, FQDN, region)
- `call_kubectl` -> Current state (pods, events)
- `az_monitoring` -> Historical data
- `run_detector` -> AKS diagnostics

Output: A ready-to-submit support case template.

### 3. Log Export

The `/k8s logs --export` creates a comprehensive archive:

```
aks-logs-2026-01-24-223500.zip
├── SUMMARY.md           # AI-generated summary
├── events.txt           # call_kubectl -> get events
├── pods.txt             # call_kubectl -> get pods
├── nodes-describe.txt   # call_kubectl -> describe nodes
├── container-logs.json  # az_monitoring -> KQL query
├── cluster-info.json    # call_az -> az aks show
└── <pod>-logs.txt       # call_kubectl -> logs
```

---

## SDK + CLI + MCP: The Power of Integration

### What Each Layer Provides

| Layer                  | Contribution                                          |
| ---------------------- | ----------------------------------------------------- |
| **Copilot SDK**  | Extensibility framework, MCP protocol, skill loading  |
| **Copilot CLI**  | User interface, command parsing, response rendering   |
| **AKS MCP**      | Azure/K8s API access, tool implementations            |
| **K8sOps Skill** | Domain expertise, workflow logic, response formatting |

### Why This Architecture Works

1. **Separation of Concerns**  -  Each layer has a single responsibility
2. **Reusability**  -  MCP servers can be used by multiple skills
3. **Declarative**  -  Skills are markdown, not code
4. **Extensible**  -  Add new MCP servers or skills without changing others

---

## Real-World Incident Response

Complete workflow using the SDK -> CLI -> MCP -> Skill stack:

```bash
# 1. Quick check (SDK loads skill, CLI renders)
/k8s status
# [ALERT] Issues detected

# 2. Deep diagnosis (skill orchestrates MCP tools)
/k8s diagnose aks01day2
# Root cause identified

# 3. Correlate logs (parallel MCP tool invocation)
/k8s logs --aggregate --timespan 1h
# Timeline across all sources

# 4. Export for support (MCP tools -> file system)
/k8s logs --export
# Creates ZIP archive

# 5. Generate case (SDK formats output)
/k8s case aks01day2
# Creates support template

# 6. Apply fix (MCP tool execution)
/k8s fix store-front-crashloop
# Patches deployment

# 7. Verify (full cycle again)
/k8s status
# [OK] All systems green
```

**Total time: 2-5 minutes**

---

## Lessons Learned

### 1. The SDK Abstracts Complexity

Without the SDK, you'd need to:

- Build MCP protocol handling
- Implement skill loading
- Handle tool invocation
- Manage response formatting

The SDK handles all of this, letting you focus on domain logic.

### 2. MCP Enables Composition

By implementing the MCP specification, the AKS server becomes composable with any MCP-compatible client  -  not just Copilot CLI.

### 3. Skills are Declarative Expertise

A well-written SKILL.md encodes the expertise of an SRE into reusable automation. It's both the implementation *and* the documentation.

### 4. Response Design Matters

The "Green Light / Red Light" model was a game-changer. Operators want signal, not data dumps.

---

## Conclusion

K8sOps demonstrates the power of the GitHub Copilot extensibility stack:

| Component              | Role                                              |
| ---------------------- | ------------------------------------------------- |
| **Copilot SDK**  | Foundation  -  extensibility APIs, MCP protocol   |
| **Copilot CLI**  | Interface  -  user interaction, skill runtime     |
| **AKS MCP**      | Bridge  -  Azure and Kubernetes API access        |
| **K8sOps Skill** | Intelligence  -  domain expertise, workflow logic |

Together, they turn a 30+ minute incident investigation into a 2-5 minute conversation.

The skill is open source:
**https://github.com/jvargh/ghcp-stuff/tree/main/K8sOps**

---

## Architecture

The K8sOps skill architecture shows the complete end-to-end flow from user input through the CLI, skill layer, MCP server, and into Azure/Kubernetes APIs. It includes detailed component diagrams for command processing, data flow, and the response formatting pipeline.

👉 **[View Full Architecture Documentation](ARCHITECTURE.md)**

---

## Demo Runbook

A step-by-step runbook that exercises all K8sOps commands in a realistic production incident response scenario. Walk through cluster health checks, deep diagnostics, log aggregation, support case generation, and remediation - complete with expected outputs and troubleshooting tips.

👉 **[View Demo Runbook](DEMO-RUNBOOK.md)**

---

## Resources

- [GitHub Copilot Extensibility](https://docs.github.com/en/copilot/building-copilot-extensions)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [AKS MCP Server](https://github.com/Azure/aks-mcp)
- [K8sOps Skill Repository](https://github.com/jvargh/ghcp-stuff/tree/main/Impact-Generator/skills/K8sOps)

---
