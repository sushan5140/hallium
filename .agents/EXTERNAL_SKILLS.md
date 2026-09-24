# Hallium — external UI/design skills

All **8 requested upstream repositories are registered as pinned Git submodules**, not copied source files. This leaves license notices and original folder structures intact, avoids large binary assets in Hallium's own history, and makes each source auditable. The tracked SHA of each upstream appears in Git's tree/submodule status.

## Clone/hydrate on your computer

From the existing local Hallium repository in PowerShell:

```powershell
git pull --ff-only origin main
git submodule update --init --recursive
git submodule status
```

For a new checkout, use `git clone --recurse-submodules https://github.com/sushan5140/hallium.git`.

**Submodule entries are pointers**. Their actual content is fetched on your computer when running `git submodule update --init --recursive`; GitHub's source tree and the Hallium Vercel app do not automatically expose/render the eight source folders as ordinary files. Hallium's current deployment does not depend on these developer tools.

## Sources and intended use

| Repository | Location inside Hallium | Intended work |
|---|---|---|
| emilkowalski/skills | `.agents/skill-sources/emil-kowalski/skills/` | Motion, interaction polish, animation reviews and design engineering |
| anthropics/skills | `.agents/skill-sources/anthropic/skills/` | Frontend design and web app testing; other general skills remain available |
| nextlevelbuilder/ui-ux-pro-max-skill | `.agents/skill-sources/ui-ux-pro-max/.claude/skills/ui-ux-pro-max/` | Visual direction, hierarchy and multi-stack design lookup |
| hamen/material-3-skill | `.agents/skill-sources/material-3/skills/material-3/` | Material Design 3 and accessibility |
| multica-ai/andrej-karpathy-skills | `.agents/skill-sources/karpathy/skills/karpathy-guidelines/` | Development simplicity, careful coding and disciplined verification |
| delphi-ai/animate-skill | `.agents/skill-sources/animate-skill/` | Frontend animation |
| kylezantos/design-motion-principles | `.agents/skill-sources/design-motion-principles/skills/design-motion-principles/` | Timings, reduced motion, feedback and transitions |
| AgentsORG/design-engineering | `.agents/skill-sources/design-engineering/skills/design-engineering/` | Production-quality design and frontend execution |

These repositories are **research/development resources**. They do not grant themselves access to accounts, install dependencies, or change the deployed UI. Read each SKILL.md and relevant references before use, do not blindly run install scripts, review license and external dependencies, and select only skills relevant to a given task.

## Updating

To inspect latest upstream changes (without automatically adopting them): `git submodule foreach 'git fetch origin'`. Review changes and move each submodule pointer in a separate commit when approved. Avoid automatically tracking upstream HEAD in production. The default CI checkout does not initialize submodules, so the eight repositories are not bundled into the production Next.js build.
