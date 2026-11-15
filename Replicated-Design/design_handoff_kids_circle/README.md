# Kids Meditation Circle (USA) — handoff

Built in code first (Nov 2026) from the team's two PDFs: *GoldenAge Kids Meditation Registration & Consent Form*
and *In-Person Workshop Participant Liability Waiver*. The design side should mirror this. Site green + gold,
Cormorant Garamond + Manrope. The PDFs' purple header and Caladea/Poppins are dropped on purpose to match the site.

## Pages
| URL | What |
|---|---|
| `/kids` | Program page: hero, "What your child gains" (3 cards), "Inside a 30-minute session" (6 steps), "Program at a glance" (ET / CT / MT / PT table, plus the visitor's own time when outside the US), dark "Our child-safety promise" band, "Register your child". **No Zoom ID or passcode.** |
| `/kids/register` | Google sign-in, then 3 steps: **1 Children** (1–4; first, last, age 4–17, session as radio cards — picked from age, meditation before, group photo Yes/No, notes for teachers) · **2 Parent** (name, relationship, email, mobile/WhatsApp, emergency contact + phone, city, US state, how did you hear) · **3 Consent** (8 sections, each ticked; the release boxed and bold; photo answers summary; "I agree to sign electronically"; typed full name must match the parent name; date). Done screen: Zoom ID + passcode, parents' WhatsApp, "Open My family". |
| `/dashboard/family` | **My family**: re-sign banner when the wording changes; How to join (Zoom, WhatsApp); children with session times, **Group photos Yes/No** switch, Withdraw; Signed forms list. |
| `/dashboard/family/consent/:id` | Signed copy: exact text, ticks, children, typed signature, time, record id KC-n, text fingerprint, IP. "Print or save as PDF". |
| Admin → People → **Kids Circle** | **Overview** (children, families/siblings, new this week, came in last 4 weeks / never yet, sessions held + average, no-photo children, families to re-sign, withdrawn; week-by-week chart; by session / age / state / how heard / meditation before; recent sessions). **Children** (search, session, status, CSV export; row opens the family: contacts, notes, every signed consent with IP + fingerprint). **Session roster** (session + date; tick present; red "No photos" flag; teacher notes). |

Email to the parent: "Kids Meditation Circle: you are registered", with children + times, Zoom details ("keep these private"),
WhatsApp, the 4 "after you register" steps, the full signed copy and the US questions number.

## Rules built in
- Zoom details only reach a parent with an active, current signature (page + email). Set a strong `KIDS_ZOOM_PASSCODE` (not 1111).
- Every signature is a new row (`kid_consents`): never overwritten. Wording change = bump `KidsConsent::VERSION`; parents are asked to sign again and lose the Zoom details until they do.
- Notes for teachers are stored encrypted. Every admin family view and CSV export is written to the activity log.
- Access: Admin `members.view` sees everything; ticking attendance needs `members.edit`.
- Nothing is Texas-only: governing state = `KIDS_GOVERNING_STATE` (default Texas) for online; in-person waivers will take the event's state. New sessions = add a group in `config/kids.php`.

## Fixes made to the PDFs' content
1. Zoom ID + passcode removed from public material.
2. Release names "ordinary negligence" and is conspicuous (Texas fair-notice rule); excludes gross negligence; adds severability + governing law.
3. E-SIGN / UETA consent, typed name must match, time + IP recorded, copy emailed.
4. Child-safety promise added (two adults, no private chats / 1:1 rooms, waiting room by name, no recording, screened volunteers, reporting laws, parents may watch, parent contacted if a child is upset).
5. Photos: one Yes/No per child (the PDF allowed both boxes), no full names with photos, change anytime (future use).
6. Privacy section + retention until the youngest child turns 21.
7. Time zones as ET/CT/MT/PT (DST-safe) instead of "CST/EST/PST"; Mountain added. 1–4 children instead of one sibling. Ages limited 4–17.
8. "Dr. HariKrishna" → "Dr. Hari Krishna"; organisation = Golden Age Wisdom.
9. In-person draft adds: emergency care authority, allergies/medical needs, named pick-up adults, venue hosts, property damage.

**A US attorney should review both texts before launch.**

## Open (not built yet)
- Phase 3: in-person waiver at event RSVP / QR check-in (text drafted below, `KidsConsent::inPersonSections($state)`).
- Phase 4: yearly re-sign, class reminders by email/WhatsApp.
- Teacher-only login for the roster (today: admin users with Members view/edit).
- Session day (`KIDS_DAY`) and parents' WhatsApp link (`KIDS_WHATSAPP_LINK`) to be set on the server.
- A paper/PDF version in the site theme, for families who can't fill it online.

## The texts (source of truth: `backend/app/Services/Kids/KidsConsent.php`)

### Kids Meditation Circle (online) — parent consent, v1

1. **About the program**
   - My child takes part by choice in free online sessions run by Golden Age Wisdom (the "Organization"): gentle breathing exercises (pranayama), short guided meditation, wisdom stories and games.
   - The sessions are for relaxation, well-being and general education only.
2. **Health notice and assumption of risk**
   - The Organization, its teachers and volunteers do not give medical, psychological or clinical care or advice. Dr. Hari Krishna is a physician, but these sessions do not create a doctor–patient relationship.
   - My child is physically and mentally fit to take part. If my child has a health condition, I will ask a licensed physician before my child joins.
   - Breathing and meditation can sometimes cause mild discomfort, light-headedness or strong feelings. My child may stop, rest or leave at any time. I understand these risks and accept them for my child.
3. **Release of liability** _(boxed + bold)_
   - TO THE FULLEST EXTENT PERMITTED BY LAW, I RELEASE AND DISCHARGE THE ORGANIZATION, ITS DIRECTORS, OFFICERS, SPIRITUAL LEADERS (INCLUDING DR. HARI KRISHNA), TEACHERS AND VOLUNTEERS FROM ANY CLAIM FOR INJURY OR LOSS ARISING FROM MY CHILD'S PARTICIPATION, INCLUDING CLAIMS ARISING FROM THEIR OWN ORDINARY NEGLIGENCE.
   - This release does not cover gross negligence or intentional misconduct.
4. **Parent permission and supervision**
   - I am the parent or legal guardian of each child named in this form. I give permission for each child to join the Kids Meditation Circle online.
   - A responsible adult will be at home during every session. My child will join from a safe, quiet place. I am responsible for my child's behavior and safety at home.
5. **Our child-safety promise**
   - At least two approved adults are present in every session. There are no private chats and no one-to-one breakout rooms with a child.
   - Only registered children are admitted from the waiting room, by name. Zoom details are sent only to registered parents.
   - Sessions are not recorded. Volunteers who work with children are screened. We follow state child-abuse reporting laws.
   - If a child seems unwell or upset, a teacher will contact the parent. Parents may watch any session.
6. **Photos**
   - Sessions are not recorded. Now and then a teacher may take a group screenshot for our website or social media, only of children whose parent says yes below. We never show a child's full name with a photo.
   - You can change your answer at any time from your member dashboard. A change applies to future use.
7. **Privacy**
   - We use these details only to run the program and contact you. We do not sell or share them. Only program coordinators and teachers can see them.
   - You can see, correct or remove your details at any time. We keep this signed form until the youngest child named turns 21, as legal records require.
8. **Electronic signature and general terms**
   - I agree to sign electronically. My typed full name is my signature, the same as signing by hand. A copy of this signed form is emailed to me and stays in my member dashboard.
   - This agreement covers every session until I withdraw, which I can do at any time. The laws of the State of Texas apply. If any part is found invalid, the rest still applies.

### In-person workshop — waiver draft, v1 (Phase 3, not live yet)

1. **About the workshop**
   - I (or my child) take part by choice in in-person meditation, gentle breathing (pranayama) and wellness programs run by Golden Age Wisdom (the "Organization"). They are for relaxation, well-being and general education only.
2. **Health notice and assumption of risk**
   - The Organization, its teachers and volunteers do not give medical, psychological or clinical care. Dr. Hari Krishna is a physician, but these programs do not create a doctor–patient relationship.
   - I (or my child) am fit to take part. If there is a health condition, I will ask a licensed physician first.
   - I understand and accept the risks, known and unknown, of attending in person, including mild discomfort, light-headedness, strong feelings, and slips or falls at the venue.
3. **Release of liability** _(boxed + bold)_
   - TO THE FULLEST EXTENT PERMITTED BY LAW, I RELEASE AND DISCHARGE THE ORGANIZATION, ITS DIRECTORS, OFFICERS, SPIRITUAL LEADERS (INCLUDING DR. HARI KRISHNA), TEACHERS, VOLUNTEERS AND VENUE HOSTS FROM ANY CLAIM FOR INJURY, PROPERTY DAMAGE OR LOSS ARISING FROM ATTENDANCE, INCLUDING CLAIMS ARISING FROM THEIR OWN ORDINARY NEGLIGENCE.
   - This release does not cover gross negligence or intentional misconduct.
4. **Children under 18**
   - I am the parent or legal guardian. I give permission for my child to attend. I or another adult I name stays at the venue for the whole event and is responsible for my child.
   - Only the adults I name may pick my child up.
5. **Emergency care**
   - If I cannot be reached in an emergency, I allow the Organization to call emergency services and to arrange first aid or emergency medical treatment. I am responsible for any cost of that care.
   - I have listed any allergies or medical needs the team should know.
6. **Photos and video**
   - Photos or video may be taken for our website, social media and records, only of people who say yes below. We never show a child's full name with a photo. You can change your answer at any time; it applies to future use.
   - If you say no, please tell the check-in desk so the photographer knows.
7. **Electronic signature and general terms**
   - I agree to sign electronically. My typed full name is my signature. A copy is emailed to me.
   - The laws of the State of Texas apply. If any part is found invalid, the rest still applies.

