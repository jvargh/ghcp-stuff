# GitHub Copilot CLI Skills & Extensions

A collection of custom skills and documentation for extending GitHub Copilot CLI with enterprise workflows.

## Contents

### 📊 [Impact-Generator](./Impact-Generator/)

An AI-powered impact report generator using GitHub Copilot CLI and WorkIQ MCP. Transforms scattered work artifacts (calendar, emails, meetings, transcripts) into strategic impact reports with a single command.

**Key Features:**
- `/snapshot weekly` - Generate 7-day tactical reports
- `/snapshot monthly` - Generate monthly strategic summaries
- Filters activities through customizable strategic priorities
- Integrates with Microsoft 365 data via WorkIQ MCP

### ☸️ [K8sOps](./K8sOps/)

An AKS incident response skill for Kubernetes operational intelligence. Turns natural language queries into diagnostic insights and remediation commands.

**Key Features:**
- `/k8s status` - Quick cluster health checks
- `/k8s diagnose` - Deep root cause analysis
- `/k8s logs --aggregate` - Correlated log timelines from all sources
- `/k8s case` - Generate support case templates
- Integrates with Azure Kubernetes Service via AKS MCP

## Prerequisites

- [GitHub Copilot CLI](https://github.com/github/copilot-cli) installed
- MCP servers configured as needed:
  - [WorkIQ MCP](https://github.com/microsoft/work-iq-mcp) for Impact-Generator
  - [AKS MCP](https://github.com/Azure/aks-mcp) for K8sOps

## Getting Started

1. Install GitHub Copilot CLI:
   ```bash
   winget install GitHub.Copilot
   ```

2. Copy skills to your skills directory:
   ```bash
   cp -r Impact-Generator/skills/* ~/.copilot/skills/
   cp -r K8sOps/skills/* ~/.copilot/skills/
   ```

3. Reload skills in Copilot CLI:
   ```
   /skills reload
   ```

## Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub Copilot SDK](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)
