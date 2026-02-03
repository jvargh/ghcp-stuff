# Prerequisites Checklist - Agentic DevOps & Copilot Deep Dive Workshop

**Workshop Date:** \[Insert Date\]  
**Duration:** 6 hours  
**Status:** \[Complete/In Progress/Not Started\]

---

## Overview

This checklist ensures all participants and the organization are prepared for the workshop. Complete all items by the dates specified. Three team roles have action items: **IT/Admin**, **Participants**, and **Organizer/Training Lead**.

---

## SECTION 1: IT/Admin Responsibilities (Must Complete 1 Week Before)

### ✓ Copilot Licenses

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Verify all \[count\] participants have active GitHub Copilot licenses | Yes | ☐ | \[IT/Admin name\] | Check GitHub Org → Settings → Copilot to confirm license count |
| Ensure licenses are not trials (must be paid licenses) | Yes | ☐ | \[IT/Admin name\] | Trials do not have full Agent capabilities |
| Document any participants without licenses | Yes | ☐ | \[IT/Admin name\] | Flag early so we can plan workarounds |

### ✓ Copilot Coding Agent (Labs 1 & 3)

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Verify Copilot Coding Agent is enabled at org level | Yes | ☐ | \[Admin name\] | GitHub Org → Settings → Copilot → Enable Coding Agent |
| Confirm org policy allows Actions workflows to run | Yes | ☐ | \[Admin name\] | Labs depend on GitHub Actions execution |
| Test: Create a test issue and assign to Copilot to verify workflow triggers | Yes | ☐ | \[Admin/Tech name\] | If it fails, troubleshoot before workshop |

### ✓ Agent Mode in VS Code (Labs 2 & 4)

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Confirm Copilot Chat extension is available in your VS Code installation | Yes | ☐ | \[IT/Admin name\] | Check if VS Code extensions are restricted or centrally managed |
| Verify org allows local GitHub Copilot Chat extension | Yes | ☐ | \[IT/Admin name\] | If extension marketplace is blocked, flag immediately |

### ✓ GitHub Advanced Security (Lab 3 Only)

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Enable GitHub Advanced Security for the repositories participants will use | Yes | ☐ | \[Admin name\] | GitHub Org → Settings → Security → Enable CodeQL |
| Verify CodeQL scans are running (or can be triggered manually) | Yes | ☐ | \[Admin/Tech name\] | Lab 3 depends on security alerts |

### ✓ MCP Server Access (Labs 3 & 4)

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Confirm MCP server functionality is enabled/available in your environment | Yes | ☐ | \[Admin name\] | Check with GitHub/Copilot team if unsure |
| Verify no network policies block MCP server connections | Yes | ☐ | \[Network/Admin name\] | MCP integrations may require specific firewall rules |

### ✓ Repository Access (All Labs)

| Item | Required | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| Confirm participants have permissions to create repositories | Yes | ☐ | \[Admin name\] | GitHub Org → Member Permissions → Allow repo creation |
| Verify participants can access the template repository | Yes | ☐ | \[Admin name\] | \[Insert template repo URL\] |

---

## SECTION 2: Participant Responsibilities

### ✓ GitHub Account Setup (Complete 2 Weeks Before)

| Item | Required | Status | Notes |
| --- | --- | --- | --- |
| Create/verify GitHub account at \[github.com or Enterprise URL\] | Yes | ☐ | If using GitHub Enterprise, use company GitHub instance |
| Verify GitHub Copilot is enabled on your account | Yes | ☐ | Settings → Copilot → Confirm access |
| Set display name and profile picture (optional) | No | ☐ | Helps with team collaboration |

### ✓ Local Development Environment (Complete 2 Days Before)

| Item | Required | Details | Status |
| --- | --- | --- | --- |
| **VS Code (or GitHub Codespaces) Installation** |   |   |   |
| Install latest VS Code | Yes | Download from https://code.visualstudio.com | ☐ |
| Install GitHub Copilot Chat extension | Yes | Search "GitHub Copilot Chat" in VS Code extensions | ☐ |
| Verify Agent Mode is available | Yes | Open Copilot panel and look for Agent Mode selector | ☐ |
| _OR_ Use GitHub Codespaces instead | Optional | If local VS Code is not available, use Codespaces | ☐ |
| **Node.js & npm Setup** |   |   |   |
| Install Node.js v18+ | Yes | Download from https://nodejs.org (LTS version) | ☐ |
| Verify npm is installed | Yes | Run `npm --version` in terminal | ☐ |
| **Git Setup** |   |   |   |
| Install Git | Yes | Download from https://git-scm.com | ☐ |
| Configure Git username | Yes | Run `git config --global user.name "Your Name"` | ☐ |
| Configure Git email | Yes | Run `git config --global user.email "your@email.com"` | ☐ |
| **Browser** |   |   |   |
| Install modern browser (Chrome, Firefox, Safari, Edge) | Yes | Required for GitHub.com operations | ☐ |

### ✓ Test Setup (Complete 1 Day Before)

| Item | Required | Status | Notes |
| --- | --- | --- | --- |
| Clone the template repository locally | Yes | ☐ | `git clone [template-repo-url]` |
| Run `npm install` in backend folder | Yes | ☐ | Test that dependencies install |
| Run `npm install` in frontend folder | Yes | ☐ | Test that dependencies install |
| Start backend: `npm start` (in backend folder) | Yes | ☐ | Verify no errors; should run on localhost:3001 |
| Start frontend: `npm run dev` (in frontend folder, new terminal) | Yes | ☐ | Verify no errors; should run on localhost:5173 |
| Open http://localhost:5173 in browser | Yes | ☐ | Confirm application loads |
| Test Git access: Create a test branch and push to GitHub | Yes | ☐ | Ensures you have push permissions |
| Stop local servers (Ctrl+C) before workshop day | Yes | ☐ | We will restart them during labs |

### ✓ Knowledge Verification (Self-Assessment)

| Topic | Expected Level | Self-Assessment | Notes |
| --- | --- | --- | --- |
| Git/GitHub basics | Comfortable with clone, commit, push, PR workflows | ☐ Comfortable / ☐ Need Review | Recommend: [GitHub Basics Tutorial](https://docs.github.com/en/get-started) |
| Basic web development | Understand frontend/backend concepts | ☐ Comfortable / ☐ Need Review | Familiarity with REST APIs helpful |
| VS Code navigation | Comfortable with file explorer, terminal, extensions | ☐ Comfortable / ☐ Need Review | [VS Code Tour](https://code.visualstudio.com/docs/introvideos/basics) |
| REST APIs | Basic understanding of HTTP methods | ☐ Comfortable / ☐ Need Review | Understand GET, POST, PUT concepts |
| GitHub Copilot basics | Some hands-on experience with code completion or chat | ☐ Comfortable / ☐ Need Review | Play with Copilot before workshop |

---

## SECTION 3: Organizer/Training Lead Responsibilities

### ✓ Pre-Workshop Coordination (Complete 1 Week Before)

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Send this checklist to all participants | Training Lead | ☐ | Include completion deadline (2 days before workshop) |
| Collect status updates from IT/Admin on org-level setup | Training Lead | ☐ | Confirm Licenses, Coding Agent, GHAS are ready |
| Send test repository link to all participants | Training Lead | ☐ | Ensure everyone can clone and test locally |
| Collect participant completion confirmations | Training Lead | ☐ | Follow up on any blockers |
| Prepare setup troubleshooting guide | Training Lead | ☐ | For common issues participants may encounter |

### ✓ Day-Before Verification (Complete 1 Day Before)

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Send final reminder email with Zoom/meeting link | Training Lead | ☐ | Include setup verification link |
| Verify trainer/instructor environment is ready | Training Lead | ☐ | Test all demo scenarios on instructor machine |
| Confirm demo repositories are accessible | Trainer | ☐ | Test cloning, issue creation, PR workflows |
| Test Copilot Coding Agent workflow end-to-end | Trainer | ☐ | Create issue → Assign → Check Actions → Review PR |
| Test Agent Mode in VS Code | Trainer | ☐ | Verify extension, Agent Mode selector, chat features |
| Test MCP server integration (if using in labs) | Trainer | ☐ | Verify connections and tool availability |

### ✓ Day-Of Setup (Complete 30 Min Before Workshop Starts)

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Log into video conference 15 minutes early | Trainer | ☐ | Test audio, video, screen sharing |
| Have backup terminal windows open with necessary commands | Trainer | ☐ | Ready to run demos without delays |
| Display this checklist for participant reference (optional) | Trainer | ☐ | Helps participants remember what to have installed |
| Have participants do a 5-minute tech check | Trainer | ☐ | Confirm they can see screen, hear audio, access repos |

---

## Troubleshooting & Support

**Issue:** Copilot license error  
**Solution:** Contact IT to verify license assignment. Licenses can take up to 24 hours to activate.

**Issue:** Coding Agent not available  
**Solution:** Confirm with GitHub org admin that Copilot Coding Agent is enabled. May require GitHub Enterprise.

**Issue:** Node.js or npm errors during npm install  
**Solution:** Ensure Node.js v18+ is installed. Run `node --version` and `npm --version`. Reinstall if needed.

**Issue:** Can't clone repository  
**Solution:** Verify Git is installed (`git --version`). Check SSH key setup or use HTTPS clone URL instead.

**Issue:** Port 3001 or 5173 already in use  
**Solution:** Modify the port in package.json, or stop other applications using those ports.

**Issue:** VS Code extension not installing  
**Solution:** Check if extension marketplace is blocked by IT. Codespaces or GitHub Copilot web interface are alternatives.

**Contact:** \[Training Lead Email\] or \[Support Channel\]

---

## Completion Summary

| Role | Owner | Deadline | Completed |
| --- | --- | --- | --- |
| IT/Admin Setup | \[Name\] | 1 week before | ☐ |
| Participant Setup | All participants | 2 days before | ☐ |
| Final Verification | Training Lead | 1 day before | ☐ |
| Day-Of Tech Check | Trainer | Day of (30 min early) | ☐ |

**Final Status:** Ready for workshop ☐ / Blockers remain ☐

If blockers remain, contact \[Training Lead Email\] immediately.

---