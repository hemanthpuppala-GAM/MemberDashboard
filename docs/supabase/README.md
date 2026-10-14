# Supabase schema (live site) — reference for the MySQL migration

The live site (`goldenagewisdom-redesign`) stores its data in Supabase project
`aicjclttdubvaslootfz`. Decision (Oct 2026): MemberDashboard stays on **MySQL**
(GoDaddy). Before production cut-over, this data is copied once into MySQL.

| Supabase table | Contents | MySQL target (planned) |
|---|---|---|
| `members` (+ `reserved_numbers`) | member number `GAW-nnnnnn`, name, email, role | `members` |
| `practice` | one JSON blob per email: sits, journal entries, event RSVPs | `practice_sessions`, `member_journal_entries` |
| `support_agents`, `support_sessions`, `support_calls` | Support Desk sign-ins and call log | new tables (no MySQL equivalent yet) |
| `volunteers` | volunteer sign-ups (teams, availability, occupation, member_num) | `volunteer_applications` — columns now match (teams = `volunteer_categories.slug`) |

## Syncing (built)

`php artisan supabase:sync` (dry run) / `--write`, or **Admin → People → Data sync**. Needs
`SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (service_role) in the backend `.env` — never commit the key.
Without a key: export each table from the Supabase Table Editor as CSV/JSON into one folder and run
`php artisan supabase:sync --from=/path/to/folder --write`. Safe to repeat; nothing is ever deleted.

| Supabase | MySQL | Matching |
|---|---|---|
| `reserved_numbers` | `reserved_member_numbers` | member_num |
| `members` | `members.member_num` | email; the live site's number wins — a staging member holding it is moved to the next free number (reported) |
| `volunteers` | `volunteer_applications` (+ `member_id`) | email; teams merged; no desk ticket for past sign-ups |
| `practice.data.sits[]` `{date, mins, via?, ts?}` | `practice_sessions` | `import_key` = hash of the sit (identical sits on one day stay separate) |
| `practice.data.journal[]` `{date, text}` | `member_journal_entries` | `import_key` |
| `practice.data.events` | — | RSVPs, not imported |
| `support_agents` | `support_agents` (kind core) | phone; pgcrypto bcrypt hash kept, so the desk password still works as the PIN |
| `support_calls` | `tickets` (source `call`) + internal note | `import_key` `sb-call-{id}`; resolved when outcome is Resolved / follow-up done |

One-way (Supabase → MySQL) until cut-over; the live site keeps issuing numbers, so run the sync again
just before switching.

Files here are the original Supabase SQL, kept verbatim for reference.
Have: `members.sql`, `practice.sql`, `volunteers.sql` + `volunteers-occupation.sql`, `support-desk.sql`.
`practice.data` shape taken from the live site's Member Flow (`{sits, journal, events}`).
