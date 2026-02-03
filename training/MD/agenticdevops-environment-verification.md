# Environment Verification Plan - Agentic DevOps & Copilot Deep Dive Workshop

**Workshop Date:** \[Insert Date\]  
**Verification Deadline:** 1 day before workshop  
**Contact for Issues:** \[Training Lead Email\]

---

## Overview

This document provides step-by-step instructions to verify that your environment is ready for the workshop. Each section corresponds to a specific component. Complete all sections and verify each checkpoint before workshop day.

---

## PHASE 1: GitHub Account & Copilot Access (IT/Admin + Participant)

### Step 1.1: Verify GitHub Account

**Participant Action:**

```
# 1. Go to https://github.com (or your GitHub Enterprise URL)
# 2. Sign in with your GitHub account
# 3. Verify you can access the organization/team page
```

**Expected Result:** You are logged in and can see your GitHub organizations.  
**Status:** ☐ Complete

---

### Step 1.2: Verify Copilot License

**Participant Action:**

```
1. Go to GitHub.com or GitHub Enterprise
2. Click your profile icon (top right) → Settings
3. Navigate to GitHub Copilot (left sidebar)
4. Verify "GitHub Copilot" shows as active/enabled
5. Note: If you see a prompt to purchase, contact IT
```

**Expected Result:** Copilot access is confirmed in your settings.  
**Status:** ☐ Complete

**IT/Admin Action (verification):**

```
1. Go to GitHub Organization Settings
2. Navigate to Billing & Plans → Copilot
3. Under "Copilot Seats", verify all workshop participants are assigned licenses
4. Check that no licenses are in "Trial" status
```

**Expected Result:** All participants have active (non-trial) Copilot licenses.  
**Status:** ☐ Complete

---

## PHASE 2: GitHub Copilot Coding Agent (Labs 1 & 3)

### Step 2.1: Verify Coding Agent is Enabled (IT/Admin)

```
1. Go to GitHub Organization Settings
2. In the sidebar, select Copilot → Policies
3. Set the "Copilot coding agent" policy to Enabled
4. If your org uses MCP on GitHub.com, set "MCP servers on GitHub.com" to Enabled
5. If your org is part of an enterprise, confirm enterprise policies allow these settings
6. (Optional) Copilot → Coding agent → Repository access: confirm repos are set to All or Selected
```

Reference: https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/add-copilot-coding-agent

**Expected Result:** Coding Agent is enabled at the organization level.  
**Status:** ☐ Complete

---

### Step 2.2: Test Coding Agent Workflow (Participant + Trainer)

**Create a test repository (or use existing):**

```
# 1. Create a new repository (or use template: [template-repo-URL])
# 2. Clone locally: git clone <repo-url>
# 3. Navigate to the repo on GitHub.com
```

**Test Assignment:**

```
1. Go to the repo → Issues tab
2. Create a new issue with title: "Test: Add a simple feature"
3. Leave the issue open
4. Assign the issue to Copilot (or use @copilot command if available)
5. Look for the 👀 emoji reaction—confirms Copilot received the assignment
```

**Monitor Workflow:**

```
1. Go to the repo → Actions tab
2. Look for a workflow run titled something like "GitHub Copilot - ..." or "copilot-swe-agent"
3. Click into the run and monitor the logs
4. Wait for the workflow to complete (3-7 minutes typically)
5. Once complete, go back to the issue and check for a Pull Request link
```

**Review the Result:**

```
1. Open the Pull Request created by Copilot
2. Review the code changes in the PR
3. Verify the changes make sense (even if they're not perfect)
4. Note any error messages or issues
```

**Expected Result:** Workflow runs, PR is created, and Copilot reasoning is visible in the PR timeline.  
**Status:** ☐ Complete

**If Workflow Fails:**

*   Verify org-level permissions allow Actions workflows
*   Check that Coding Agent is enabled (see Step 2.1)
*   Confirm no org policies are blocking the workflow
*   Contact IT or \[Training Lead Email\]

---

## PHASE 3: Agent Mode in VS Code (Labs 2 & 4)

### Step 3.1: Install VS Code & Extensions (Participant)

```
# 1. Download and install latest VS Code from https://code.visualstudio.com
# 2. Open VS Code
# 3. Go to Extensions (Ctrl+Shift+X on Windows/Linux, Cmd+Shift+X on Mac)
# 4. Search "GitHub Copilot Chat"
# 5. Install the extension
# 6. Reload VS Code if prompted
```

**Expected Result:** VS Code is installed and Copilot Chat extension is visible in extensions list.  
**Status:** ☐ Complete

---

### Step 3.2: Verify Agent Mode is Available (Participant)

```
1. Open VS Code
2. Open the Copilot Chat panel (Ctrl+Shift+I on Windows/Linux, Cmd+Shift+I on Mac)
3. Look for an "Agent Mode" selector or toggle (usually near the chat input)
4. Verify it shows as available
5. Type a simple prompt: "Hello"
6. Verify Copilot Chat responds
```

**Expected Result:** Chat panel opens, Agent Mode option is visible, and Copilot responds to prompts.  
**Status:** ☐ Complete

**If Agent Mode is Not Available:**

*   Update VS Code to latest version
*   Reinstall GitHub Copilot Chat extension
*   Check with IT—your org may have extension restrictions
*   Consider using GitHub Codespaces as alternative

---

### Step 3.3: Test Agent Mode with Codebase (Participant)

```
1. Open the test repository in VS Code (File → Open Folder)
2. Open Copilot Chat panel (Ctrl+Shift+I)
3. Type the prompt: #codebase
4. Press Enter—this provides context from your repository
5. Ask a simple question: "What does this project do?"
6. Verify Copilot scans files and responds with context
```

**Expected Result:** Copilot scans the codebase and provides a relevant response.  
**Status:** ☐ Complete

---

## PHASE 4: Local Development Environment (Participant)

### Step 4.1: Install Node.js & npm

```
# 1. Download Node.js v18+ LTS from https://nodejs.org
# 2. Run the installer and follow prompts
# 3. Verify installation:
node --version
npm --version
# Both should show version numbers (e.g., v18.16.0 and 9.0.0)
```

**Expected Result:** Node.js v18+ and npm are installed and accessible from terminal.  
**Status:** ☐ Complete

---

### Step 4.2: Install Git

```
# 1. Download Git from https://git-scm.com
# 2. Run the installer (use default options)
# 3. Verify installation:
git --version
# Should show version (e.g., git version 2.40.0)

# 4. Configure Git (one-time):
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 5. Verify configuration:
git config --list | grep user
```

**Expected Result:** Git is installed and configured with your name and email.  
**Status:** ☐ Complete

---

### Step 4.3: Clone & Test Repository

```
# 1. Create a workspace folder for the workshop:
mkdir workshop
cd workshop

# 2. Clone the template repository:
git clone <template-repo-url>
cd <repo-name>

# 3. Verify the clone was successful:
ls -la  # You should see folders like backend, frontend, .github, etc.
```

**Expected Result:** Repository is cloned and directory structure is visible.  
**Status:** ☐ Complete

---

### Step 4.4: Install Dependencies

```
# Backend setup:
cd backend
npm install
npm start
# Expected: Backend starts on http://localhost:3001 (or similar port)
# Leave it running for now

# In a new terminal, frontend setup:
cd frontend
npm install
npm run dev
# Expected: Frontend starts on http://localhost:5173 (or similar port)
```

**Expected Result:** Both npm install commands complete without errors.  
**Status:** ☐ Complete

---

### Step 4.5: Test the Application

```
# 1. Open your browser
# 2. Go to http://localhost:5173
# 3. You should see the application UI (e.g., book list)
# 4. Try clicking around—verify the app is responsive
# 5. Check browser console (F12) for any errors
```

**Expected Result:** Application loads in browser without critical errors.  
**Status:** ☐ Complete

**Closing the Application:**

```
# In both terminals where backend and frontend are running, press Ctrl+C to stop
# Both should shut down without errors
```

---

## PHASE 5: GitHub Advanced Security (Lab 3 - Optional)

### Step 5.1: Enable CodeQL (Admin)

```
1. Go to the repository → Settings
2. In the sidebar, under "Security", select Code quality
3. Click Enable code quality
4. Review settings (languages and runner type)
5. Click Save changes
6. Wait for the first analysis run to complete
```

Reference: https://docs.github.com/en/code-security/how-tos/maintain-quality-code/enable-code-quality

**Expected Result:** CodeQL workflow is triggered and scans are running.  
**Status:** ☐ Complete

---

### Step 5.2: Verify Security Alerts (Admin/Participant)

```
1. Go to the repository → Security tab → Code scanning alerts
2. Wait for CodeQL to complete its scan (5-10 minutes)
3. You should see at least one alert (or optionally zero if code is very clean)
4. If alerts appear, note the alert title and severity
5. This is what we will use in Lab 3 for remediation
```

**Expected Result:** CodeQL scan completes and alerts are visible (or confirmed as zero).  
**Status:** ☐ Complete

---

## PHASE 6: MCP Server Access (Lab 4 - Optional)

### Step 6.1: Verify MCP Configuration (Admin/Trainer)

```
1. Confirm prerequisites: GitHub account, Visual Studio Code, and (for Business/Enterprise) "MCP servers in Copilot" policy enabled
2. In VS Code, open Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. In the Extensions search bar, click the filter icon and select "MCP Server"
4. Search for "github" and select the GitHub MCP server
5. Click Install
6. Open Command Palette and run "MCP: List Servers" to verify "github" is listed
```

Reference: https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server

**Expected Result:** MCP server access is confirmed and accessible.  
**Status:** ☐ Complete

---

## PHASE 7: Permission & Access Verification (Admin)

### Step 7.1: Verify Repository Creation Rights

```
1. Ask a participant to create a new test repository in the org
2. Steps:
   - Go to GitHub Org page
   - Click "+ New" → New repository
   - If this option is grayed out, participant lacks permissions
   - If successful, repository is created
3. Contact IT if participants cannot create repos
```

**Expected Result:** Participants can create repositories within the organization.  
**Status:** ☐ Complete

---

### Step 7.2: Verify Participant Access to Template Repository

```
1. Share the template repository URL with all participants
2. Each participant goes to the URL and clicks "Use this template" → "Create a new repository"
3. If access is denied, verify:
   - Participant is part of the GitHub organization
   - Org policies allow repository creation
   - Template repository is not private (or participants have access)
```

**Expected Result:** All participants can clone/template the repository.  
**Status:** ☐ Complete

---

## PHASE 8: Pre-Workshop Verification Call (Optional)

### Step 8.1: Schedule 30-Min Verification Call (Trainer + IT/Admin)

```
1. Schedule a brief video call 1-2 days before the workshop
2. Agenda:
   - Confirm all org-level setup is complete (Licenses, Coding Agent, GHAS)
   - Address any participant blockers
   - Walk through any custom process (e.g., MCP integration)
   - Answer questions about the labs
3. Document any remaining issues and mitigation plans
```

**Expected Result:** Call is held and blockers are identified/resolved.  
**Status:** ☐ Complete

---

## Final Verification Checklist

### All Phases Complete?

| Phase | Description | Status |
| --- | --- | --- |
| Phase 1 | GitHub Account & Copilot License | ☐ Complete |
| Phase 2 | Coding Agent Workflow | ☐ Complete |
| Phase 3 | Agent Mode in VS Code | ☐ Complete |
| Phase 4 | Local Dev Environment (Node.js, Git, App) | ☐ Complete |
| Phase 5 | GitHub Advanced Security (optional) | ☐ Complete |
| Phase 6 | MCP Access (optional) | ☐ Complete |
| Phase 7 | Permissions & Access | ☐ Complete |
| Phase 8 | Pre-Workshop Call (optional) | ☐ Complete |

---

## Troubleshooting Guide

| Issue | Verification Step | Solution |
| --- | --- | --- |
| Copilot license not showing | Step 1.2 | Contact IT—license activation takes 24 hours |
| Coding Agent workflow doesn't trigger | Step 2.2 | Verify Coding Agent enabled (Step 2.1); check org policies |
| Agent Mode not available in VS Code | Step 3.2 | Update VS Code; reinstall extension; check IT firewall rules |
| npm install fails | Step 4.4 | Delete `node_modules` folder and retry; ensure Node.js v18+ |
| Repository not cloning | Step 4.3 | Verify SSH key setup or use HTTPS URL instead; check Git config |
| Port 3001/5173 in use | Step 4.4 | Stop other applications using those ports or modify in package.json |
| CodeQL scan doesn't run | Step 5.1 | Verify GitHub Advanced Security is enabled; wait another 5 minutes |
| MCP server connection fails | Step 6.1 | Check network firewall; verify MCP server is deployed and running |

---

## Sign-Off

**Participant:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**IT/Admin:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Training Lead:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**All verifications complete? YES ☐ / NO ☐**

If NO, describe remaining issues and escalation plan:

---

---

---

## Support & Contact

**For technical issues:** \[Training Lead Email\]  
**For org-level access:** \[IT/Admin Contact\]  
**For Copilot licensing:** \[GitHub Account Manager or Support\]

See attached troubleshooting guide for common issues.

---