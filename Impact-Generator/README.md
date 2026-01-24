# 🚀 I Built an AI-Powered Impact Report Generator (And You Can Too)

**From scattered work artifacts to strategic impact reports - with a single command.**

---

## 😫 The Problem

It's Friday afternoon. Leadership asks for a status update.

You stare at your calendar. Scroll through emails. Try to remember that important customer meeting from Tuesday...

Sound familiar?

I spent **hours each month** compiling status reports, digging through meeting notes, and trying to recall what actually mattered versus what was just noise.

**So I built a solution.**

Using **GitHub Copilot CLI** and **WorkIQ**, I now generate comprehensive weekly or monthly impact snapshots with a single command.

Here's exactly how I did it. 👇

---

## 🧱 The Building Blocks

### GitHub Copilot CLI

AI-powered assistance directly in your terminal. The real power? **Extensibility through Skills.**

### Skills

Reusable instruction sets - think "recipes" that define:

- ✅ When to activate
- ✅ What data to gather
- ✅ How to process it
- ✅ What output to generate

### WorkIQ

An MCP server that connects Copilot to your **Microsoft 365 data**: calendar, emails, files, Teams chats, and meeting transcripts.

It transforms Copilot from a general assistant into one that **actually knows what you've been working on.**

### MCP (Model Context Protocol)

An open standard allowing AI to securely access external data. MCP servers act as bridges between Copilot and your enterprise systems.

---

## 🔗 How It All Connects

```
┌─────────────────────────────────────┐  ┌──────────────────────────────────────────────────────────────────┐
│       USER'S LOCAL MACHINE          │  │                         M365 CLOUD                               │
├─────────────────────────────────────┤  ├──────────────────────────────────────────────────────────────────┤
│                                     │  │                                                                  │
│  ┌─────────────────┐                │  │  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │ Terminal / Shell│                │  │  │  M365 Copilot   │◄──►│  M365 Copilot   │◄──►│  User's M365 │  │
│  └────────┬────────┘                │  │  │    Chat API     │    │     Service     │    │     Data     │  │
│           │                         │  │  └────────▲────────┘    └─────────────────┘    └──────────────┘  │
│           │ User Queries            │  │           │                                            │         │
│           ▼                         │  │           │                                            │         │
│  ┌─────────────────┐                │  │           │ HTTPS                                      ▼         │
│  │ GitHub Copilot  │                │  │           │ (OAuth 2.0)               ┌────────────────────────┐ │
│  └────────┬────────┘                │  │           │                           │ • Emails (Outlook)     │ │
│           │                         │  │           │                           │ • Calendar/Meetings    │ │
│           │ MCP                     │  │           │                           │ • Files (OneDrive)     │ │
│           ▼                         │  │           │                           │ • Teams Chats          │ │
│  ┌─────────────────┐                │  │           │                           │ • Contacts             │ │
│  │   WorkIQ.exe    │────────────────┼──┼───────────┘                           └────────────────────────┘ │
│  │   MCP Server    │                │  │                                                                  │
│  └─────────────────┘                │  │                                                                  │
│                                     │  │                                                                  │
└─────────────────────────────────────┘  └──────────────────────────────────────────────────────────────────┘
```

**The Flow:**

1. You query Copilot CLI in your terminal
2. Copilot communicates with WorkIQ via MCP
3. WorkIQ connects to M365 Copilot Chat API (HTTPS + OAuth 2.0)
4. M365 retrieves your data: Emails, Calendar, Files, Teams, Contacts
5. **Result:** A contextual response that understands your entire work graph

---

## 🛠️ The Build: Natural Language >> Working Skill

Here's the exciting part: **you don't manually write skill files.**

You describe what you want, and Copilot creates it for you.

### Step 1: Install GitHub Copilot CLI

```bash
winget install GitHub.Copilot
```

### Step 2: Enable WorkIQ

```bash
copilot                                          # Open Copilot CLI
/plugin marketplace add github/copilot-plugins   # Add marketplace (one-time)
/plugin install workiq@copilot-plugins           # Install WorkIQ
```

Restart Copilot CLI, then query your M365 data:

```
> Who is my manager?
```

Accept the EULA on first use. Now Copilot can access your M365 data.

### Step 3: Build Your Skill

Here's my actual prompt:

```
Create a skill called Impact-Snapshot with two tools: weekly and monthly.

Have it analyze my calendar, meetings, and transcripts for the specified 
time period. Generate a markdown report for leadership that filters 
activities through my strategic priorities - focus on boss-worthy items 
that demonstrate strategic impact, not a comprehensive activity dump.

My priorities are:
1. Rebuild Trust Through Team Success
2. Turn AI Into Growth  
3. Simplify to Accelerate Impact
4. Communicate With Clarity
```

**Done.** Copilot automatically:

- Created `~/.copilot/skills/Impact-Snapshot/`
- Generated the full `SKILL.md` workflow
- Defined `/snapshot weekly` and `/snapshot monthly` tools

---

## ⚡ Using It

### Command Options

| Command | Description |
|---------|-------------|
| `/snapshot weekly` | Generates a 7-day tactical report (1 page max) |
| `/snapshot monthly` | Generates current month's strategic report (2 pages max) |
| `/snapshot monthly [Month-Year]` | Generates a specific month's report |

### Usage Examples

```bash
# This week's report
> /snapshot weekly

# This month's report
> /snapshot monthly

# Specific month's report
> /snapshot monthly November-2025
> /snapshot monthly December
```

### What Each Tool Produces

| Tool | Focus | Length | Content |
|------|-------|--------|---------|
| weekly | Tactical wins, meeting outcomes | 1 page | Executive summary, accomplishments by priority, key meetings table |
| monthly | Strategic themes, patterns | 2 pages | Impact by priority, metrics table, relationships, looking ahead |

**Both tools:**

- Pull data via WorkIQ (calendar, transcripts, emails, files)
- Filter through strategic priorities
- Ask for confirmation before generating
- Save markdown to Desktop

### Sample Output:

```markdown
# Weekly Snapshot: January 19-24, 2026

## Executive Summary
This week focused on accelerating customer outcomes...

## Key Accomplishments

### 🤝 Team Success & Partnerships
- Drove escalation process improvement, reducing delays

### 🚀 AI-Driven Impact  
- Completed AI Agent training sessions
```

---

## 📊 Results

| Metric                | Before       | After                  |
| --------------------- | ------------ | ---------------------- |
| Time to create report | 30-45 min    | **2 min**        |
| Items forgotten       | Many         | Few                    |
| Strategic alignment   | Variable     | **Consistent**   |
| Report quality        | Inconsistent | **Professional** |

---

## 💡 Other Use Cases

**Meeting Prep Assistant**

```
> /prep "Customer Account Review"
```

>> Pulls action items, recent emails, generates briefing doc
>>

**Customer Health Dashboard**

```
> /customer-health Contoso
```

>> Aggregates tickets, sentiment, flags risks
>>

**Incident Retrospective**

```
> /retro incident-12345
```

>> Builds RCA document from emails/chats
>>

**Azure Resource Manager**

```
> List my Azure resource groups
```

>> Query cloud resources conversationally
>>

---

## 🎯 Key Takeaways

1. **Skills turn Copilot into a workflow engine** - define once, run repeatedly
2. **MCP servers unlock enterprise context** - WorkIQ, Azure MCP, GitHub MCP bridge your systems
3. **Natural language creates skills** - describe what you want; Copilot builds it
4. **Human-in-the-loop improves accuracy** - confirmation steps catch what automation misses
5. **Skills are editable** - find them at `~/.copilot/skills/<name>/SKILL.md`

---

## 🔮 The Future is Agentic

What we built here is just the beginning. Imagine:

- **Cross-system orchestration** - report >> email draft >> follow-up scheduled, all from one command
- **Proactive insights** - *"You have 3 customer meetings tomorrow. Here are likely topics."*
- **Continuous learning** - skills that adapt based on your feedback

The terminal is becoming the new interface for knowledge work.

We're just scratching the surface.

---

## 📚 References & Resources

- **[GitHub Copilot SDK](https://github.blog/news-insights/company-news/build-an-agent-into-any-app-with-the-github-copilot-sdk/)** - Build an agent into any app with the GitHub Copilot SDK
- **[WorkIQ MCP Server](https://github.com/microsoft/work-iq-mcp)** - Microsoft's MCP server that connects AI assistants to your Microsoft 365 data
- **[GitHub Copilot CLI](https://github.com/github/copilot-cli)** - AI-powered command-line assistant from GitHub
