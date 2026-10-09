# Supabase schema (live site) — reference for the MySQL migration

The live site (`goldenagewisdom-redesign`) stores its data in Supabase project
`aicjclttdubvaslootfz`. Decision (Oct 2026): MemberDashboard stays on **MySQL**
(GoDaddy). Before production cut-over, this data is copied once into MySQL.

| Supabase table | Contents | MySQL target (planned) |
|---|---|---|
| `members` (+ `reserved_numbers`) | member number `GAW-nnnnnn`, name, email, role | `members` |
| `practice` | one JSON blob per email: sits, journal entries, event RSVPs | `practice_sessions`, `member_journal_entries` |
| `support_agents`, `support_calls` | Support Desk sign-ins and call log | _to add_ |
| `volunteers` | volunteer sign-ups (teams, availability, occupation, member_num) | `volunteer_applications` |

Files here are the original Supabase SQL, kept verbatim for reference.
Have: `members.sql`, `practice.sql`, `volunteers.sql` + `volunteers-occupation.sql` (run in that order).
Still needed: support desk SQL (`RUN-IN-SUPABASE-support-desk.sql`) and one sample of the
`practice.data` JSON (names of the keys for sits, journal entries and RSVPs).
