# clideck-project-kb

A [CliDeck](https://github.com/rustykuntz/clideck) plugin that saves all your inputs from every session into a per-project knowledge base file. Point your agents to this file so they can see what you've asked other agents in the same project.

## What it does

Every time you send input to any session, the plugin appends it to a markdown file in that session's working directory:

```markdown
# Backend architect (Claude Code)

- implement the auth module using JWT
- add rate limiting to the API endpoints

# Security reviewer (Gemini CLI)

- review the auth module for security issues
- check if rate limiting handles edge cases
```

All sessions sharing the same working directory contribute to the same file. Agents can read this file to understand the full context of what you're working on across all your CLI agents.

## Install

**macOS / Linux:**
```bash
git clone https://github.com/rustykuntz/clideck-project-kb.git ~/.clideck/plugins/project-kb
```

**Windows:**
```powershell
git clone https://github.com/rustykuntz/clideck-project-kb.git "%USERPROFILE%\.clideck\plugins\project-kb"
```

Restart CliDeck. The plugin appears in the Plugins panel.

## Settings

| Setting | Description | Default |
|---|---|---|
| **Enabled** | Toggle the plugin on/off | On |
| **Filename** | Name of the knowledge base file | `project-kb.md` |

## Usage

1. Start working — every input you type is automatically saved
2. The KB file is written to each session's working directory
3. Tell your agents to read the file: *"Check project-kb.md for context on what other agents are working on"*

## Requires

CliDeck **v1.23.0+** (uses the `onTranscriptEntry` plugin hook).

## License

MIT
