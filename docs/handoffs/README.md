# Hallium Handoffs

## Canonical continuation file

Always read this file before continuing Hallium work:

`docs/handoffs/HALLIUM_CONTINUATION.md`

It is the project's living continuation/context document. It should be updated after meaningful implementation, security, database, deployment, QA, architecture, or roadmap changes.

### Continuation rule

1. Read `HALLIUM_CONTINUATION.md` before making changes.
2. Verify the repository state/HEAD instead of assuming the handoff is current.
3. Continue from the handoff's current phase and next-step section.
4. After meaningful work, update the same canonical handoff with:
   - what changed,
   - files/migrations affected,
   - commit(s),
   - verification performed,
   - unresolved bugs/risks,
   - new next steps.
5. Do not mark work complete unless verification actually passed.
6. Do not create a new dated handoff unless an archival snapshot is specifically needed.

The canonical file is intended to let a new ChatGPT, Claude, Codex, or human contributor recover the full project context without relying on chat history.
