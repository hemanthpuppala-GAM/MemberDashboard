Namaste {{ $r->guardian_name }},

Thank you. Your registration for the Golden Age Kids Meditation Circle is complete. Sessions are live on Zoom, {{ strtolower($day) }}, and free.

@foreach ($kids as $k)
- {{ $k['name'] }}, age {{ $k['age'] }}: {{ $k['group'] }} ({{ $k['times'] }}). Photos allowed: {{ $k['photos'] }}.
@endforeach

HOW TO JOIN
Zoom meeting ID: {{ $join['zoom_id'] }}
@if ($join['zoom_passcode'])Passcode: {{ $join['zoom_passcode'] }}
@endif
@if ($join['zoom_link'])Link: {{ $join['zoom_link'] }}
@endif
Please keep these details private. They are only for registered families.
@if ($join['whatsapp_link'])Parents' WhatsApp group: {{ $join['whatsapp_link'] }}
@endif

Join five minutes early with your child's first name as the Zoom name. An adult stays at home during the session.

My family (details, photo choice, signed copy): {{ $dashboardUrl }}

@if ($consent)
Signed electronically by {{ $consent->signature_name }} on {{ $consent->signed_at->timezone(config('kids.timezone'))->format('M j, Y g:i A T') }} (consent version {{ $consent->version }}, record KC-{{ $consent->id }}). The full signed text is in the HTML version of this email and on My family.
@endif

Questions? Call or WhatsApp +{{ $phone }}.
With gratitude, the Golden Age Wisdom team
