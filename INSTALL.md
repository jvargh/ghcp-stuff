# Impact Generator - Installation Guide

## Prerequisites

- [GitHub Copilot CLI](https://github.com/github/copilot-cli) installed
- Microsoft 365 account (for WorkIQ integration)
- Active Copilot subscription

## Quick Install

### 1. Copy the skill to your Copilot skills directory

**Windows (PowerShell):**
```powershell
# Create skill directory
New-Item -ItemType Directory -Path "$env:USERPROFILE\.copilot\skills\Impact-Snapshot" -Force

# Copy SKILL.md and VERSION
Copy-Item "skills\Impact-Snapshot\*" "$env:USERPROFILE\.copilot\skills\Impact-Snapshot\"
```

**macOS/Linux:**
```bash
# Create skill directory
mkdir -p ~/.copilot/skills/Impact-Snapshot

# Copy SKILL.md and VERSION
cp skills/Impact-Snapshot/* ~/.copilot/skills/Impact-Snapshot/
```

### 2. Enable WorkIQ

Launch Copilot CLI and trigger WorkIQ EULA acceptance:

```
copilot
> Who is my manager?
```

Accept the EULA when prompted.

### 3. Reload skills

```
> /skills reload
```

### 4. Test the skill

```
> /snapshot weekly
```

## Optional: Set up Weekly Impact Log

Copy the template to your Desktop for easy weekly updates:

**Windows:**
```powershell
Copy-Item "templates\Weekly-Impact-Log-Template.md" "$env:USERPROFILE\Desktop\"
```

**macOS/Linux:**
```bash
cp templates/Weekly-Impact-Log-Template.md ~/Desktop/
```

## Customization

Edit the skill file to customize for your organization:

```
~/.copilot/skills/Impact-Snapshot/SKILL.md
```

Key areas to customize:
- **Strategic Priorities** - Replace with your team's actual priorities
- **Report Sections** - Add/remove sections based on leadership preferences
- **Output Location** - Change where reports are saved

## Troubleshooting

### Skill not appearing
- Run `/skills reload` in Copilot CLI
- Verify SKILL.md is in the correct directory
- Check for YAML syntax errors in the skill header

### WorkIQ not returning data
- Ensure you've accepted the WorkIQ EULA
- Verify your M365 account has the necessary permissions
- Check that meeting transcription is enabled for your org

### Missing meeting data
- Enable transcription on meetings for detailed content
- Use the Weekly Impact Log template to capture items WorkIQ misses
- Check if meetings are older than 60 days (attendance data degrades)

## Support

For issues with:
- **GitHub Copilot CLI**: [GitHub Copilot Docs](https://docs.github.com/copilot)
- **WorkIQ**: [WorkIQ GitHub](https://github.com/microsoft/work-iq-mcp)
- **This skill**: Open an issue in this repository
