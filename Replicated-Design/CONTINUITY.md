# Working in two places — Claude Design ↔ Claude Code

Design lives in **Claude Design** (this project). Implementation lives in **GitHub → hemanthpuppala-GAM/MemberDashboard**,
edited by **Claude Code**. The repo is the shared memory. Rules that keep both in step:

## In the repo (Claude Code side)
- `Replicated-Design/` holds the design references: `Design.md` (homepage/dashboard system) and this bundle's
  `README.md` + `design/` files. Treat them as the spec.
- `Replicated-Design/CHANGELOG-design.md` is the ledger. **Every design drop appends an entry; every implementation
  pass marks items ✅ with the commit.** Claude Code should read this file first in every session.
- Add to `CLAUDE.md` at the repo root (create if missing):
  > Design references are in Replicated-Design/. Before UI work, read Replicated-Design/CHANGELOG-design.md and the
  > README in the latest design_handoff_* folder. When you implement an item, tick it in the changelog with the commit sha.
  > If you change a design decision in code (copy, colour, flow), add a "⬅ code change" line so Design can mirror it.

## In Claude Design (this side)
- `github.md` at the project root records repo, branch, last-synced commit and a screen map.
- When you come back here, say **"sync from GitHub"** — I read `github.md`, pull the changelog + changed files since the
  last commit, mirror any "⬅ code change" lines into the .dc.html designs, and rewrite `github.md`.
- When design changes here, say **"package for GitHub"** — I regenerate the handoff folder + changelog entry and give you a
  zip to drop into `Replicated-Design/`.

## Hand-off format
Each drop is `Replicated-Design/design_handoff_<feature>/` with `README.md` (spec) and `design/` (HTML references).
