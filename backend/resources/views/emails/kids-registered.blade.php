<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F3EAD3;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3EAD3;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#FFFDF8;border:1px solid #E8DDBF;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#14241C;padding:22px 32px;text-align:center;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#E8CF83;">Golden Age Wisdom</p>
        <p style="margin:6px 0 0;font-size:22px;color:#F3EAD3;">Kids Meditation Circle</p>
    </td></tr>
    <tr><td style="padding:28px 32px 8px;">
        <p style="margin:0 0 14px;font-size:17px;line-height:1.6;color:#14241C;">Namaste {{ $r->guardian_name }},</p>
        <p style="margin:0 0 18px;font-size:15.5px;line-height:1.65;color:#2E3A33;">Thank you. Your {{ $kids->count() === 1 ? 'child is' : 'children are' }} registered for the Kids Meditation Circle. Sessions are live on Zoom, {{ strtolower($day) }}, and free.</p>

        @foreach ($kids as $k)
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 10px;background:#F6F1E6;border:1px solid #E8DDBF;border-radius:12px;">
            <tr><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.55;color:#2E3A33;">
                <strong style="color:#14241C;font-size:15px;">{{ $k['name'] }}</strong> · age {{ $k['age'] }}<br>
                {{ $k['group'] }}: {{ $k['times'] }}<br>
                Photos allowed: {{ $k['photos'] }}
            </td></tr>
        </table>
        @endforeach
    </td></tr>
    <tr><td style="padding:8px 32px 6px;">
        <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7A5E22;">How to join</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#14241C;border-radius:12px;">
            <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#F3EAD3;">
                Zoom meeting ID: <strong style="color:#E8CF83;">{{ $join['zoom_id'] }}</strong><br>
                @if ($join['zoom_passcode'])Passcode: <strong style="color:#E8CF83;">{{ $join['zoom_passcode'] }}</strong><br>@endif
                @if ($join['zoom_link'])<a href="{{ $join['zoom_link'] }}" style="color:#E8CF83;">Open Zoom</a><br>@endif
                Please keep these details private. They are only for registered families.
            </td></tr>
        </table>
        <ol style="margin:14px 0 0;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.7;color:#2E3A33;">
            @if ($join['whatsapp_link'])<li>Join the parents' WhatsApp group for reminders: <a href="{{ $join['whatsapp_link'] }}" style="color:#7A5E22;">{{ $join['whatsapp_link'] }}</a></li>@endif
            <li>Set up a quiet corner with a cushion or chair before class.</li>
            <li>Join Zoom five minutes early, with your child's first name as the Zoom name. An adult stays at home during the session.</li>
            <li>Try a few minutes of breathing together during the week. Children learn by watching you.</li>
        </ol>
        <p style="margin:16px 0 0;text-align:center;"><a href="{{ $dashboardUrl }}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#C9A24A;color:#14241C;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;">Open My family</a></p>
    </td></tr>
    @if ($consent)
    <tr><td style="padding:22px 32px 8px;">
        <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7A5E22;">Your signed copy</p>
        <p style="margin:0 0 10px;font-size:16px;color:#14241C;">{{ $consent->snapshot['title'] ?? 'Parent consent' }} (version {{ $consent->version }})</p>
        @foreach ($consent->snapshot['sections'] ?? [] as $s)
            <p style="margin:12px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#14241C;">✓ {{ $s['title'] }}</p>
            @foreach ($s['paragraphs'] as $p)
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.55;color:#2E3A33;{{ !empty($s['conspicuous']) ? 'font-weight:bold;' : '' }}">{{ $p }}</p>
            @endforeach
        @endforeach
        <p style="margin:14px 0 0;padding:10px 14px;border:1px solid #E8DDBF;border-radius:10px;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.6;color:#2E3A33;">
            Signed electronically by <strong>{{ $consent->signature_name }}</strong> on {{ $consent->signed_at->timezone(config('kids.timezone'))->format('M j, Y g:i A T') }}.<br>
            Record ID KC-{{ $consent->id }} · text fingerprint {{ substr($consent->text_hash, 0, 16) }}
        </p>
    </td></tr>
    @endif
    <tr><td style="padding:22px 32px 28px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#5A5546;">Questions? Call or WhatsApp +{{ $phone }}.<br>With gratitude, the Golden Age Wisdom team</p>
    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
