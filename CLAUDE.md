# MemberDashboard — working agreements for Claude Code

## Design source of truth
- Design references live in `Replicated-Design/`. `Design.md` = homepage/dashboard visual system.
  Each `design_handoff_<feature>/README.md` = the spec for that feature; its `design/` folder holds
  the HTML references (open in a browser to see intended look/behaviour — do not ship them).
- **Start every UI session by reading `Replicated-Design/CHANGELOG-design.md`.** Items marked 🟡 are designed
  but not built. When you implement one, change it to ✅ with the commit sha.
- If you change a design decision in code (copy, colour, flow, numbers), append a "⬅ code change" line to the
  changelog so the design side can mirror it. Never silently diverge.
- Support numbers come from config/env (SUPPORT_PRIMARY=+917396112111, SUPPORT_WEB=+917396119111) — never hard-code.

## Current stack
frontend: React + Vite (`frontend/src`, member area in `frontend/src/user`). backend: Laravel (`backend/`).
