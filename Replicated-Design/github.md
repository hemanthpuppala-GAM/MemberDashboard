repo: hemanthpuppala-GAM/MemberDashboard
branch: main
path: Replicated-Design

## Last sync
date: 2026-10-09T20:40:00Z
commit: 804ed3c (Ask handoff implemented by Claude Code; design mirrored)
### Updated in this project
- Utility row (Member support / Volunteer / Privacy) above header on Home + 6 sub-pages; footer links removed
- Home package now includes Volunteer, Privacy, gaw-config, detox PDF
- Mirrored 3 code changes into Ask / Member Flow / QR Poster / QR Zoom (auto-sent ack, poster gap+QR size, Noto Indic fonts)
- Packaged Home Bodhi Tree v2 + 6 sub-pages + 7 admin editors as design_handoff_home_bodhi_tree
- Official email → goldenageguruteachings@gmail.com project-wide

## Screen map
| Screen | Design file | Repo files |
|---|---|---|
| /ask | Ask.dc.html | frontend/src (ask route), backend contact API |
| Member dashboard → Ask tab | Member Flow.dc.html | frontend/src/user |
| /ask/poster, /ask/zoom | QR Ask Poster.dc.html, QR Ask Zoom.dc.html | frontend/src |
| / (home) | Home Bodhi Tree v2.dc.html | ✅ frontend/src/site (admin: frontend/src/admin/pages/site) |
| /about … /events | About/Mission/Meditation/Wisdom/Wellness/Events.dc.html | ✅ frontend/src/site (admin: frontend/src/admin/pages/site) |
| /volunteer, /privacy | Volunteer.dc.html, Privacy.dc.html | ✅ frontend/src/site (admin: frontend/src/admin/pages/site) |
| /admin/content/* | Admin *.dc.html | ✅ frontend/src/site (admin: frontend/src/admin/pages/site) |
