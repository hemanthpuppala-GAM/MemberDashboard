<!doctype html>
<html><body style="margin:0;background:#F3EAD3;font-family:Arial,sans-serif;color:#14241C">
<div style="max-width:560px;margin:0 auto;padding:28px 22px">
  <p style="font-size:15px">Namaste {{ $name }},</p>
  <p style="font-size:15px;line-height:1.6">{{ $by }} assigned ticket <strong>{{ $ticket->ref }}</strong> to you.@if ($ticket->priority === 'urgent') <strong style="color:#9A3B2E">It is marked urgent.</strong>@endif</p>
  <p style="margin:18px 0 6px;font-size:13px;color:#5A5546">{{ $from }} asked:</p>
  <p style="margin:0;font-size:16px;font-weight:bold;line-height:1.4">“{{ $ticket->subject }}”</p>
  <blockquote style="margin:12px 0;padding:12px 16px;background:#FFFDF8;border-left:3px solid #C9A24A;border-radius:8px;font-size:15px;line-height:1.6;white-space:pre-line">{{ $question }}</blockquote>
  <p style="margin:22px 0"><a href="{{ $url }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14241C;color:#E8CF83;text-decoration:none;font-weight:bold">Open the ticket</a></p>
  <p style="font-size:14px;line-height:1.6;color:#5A5546">Reply to the member there, or add an internal note for the team.</p>
  <p style="font-size:13px;color:#5A5546">Golden Age Wisdom support desk</p>
</div>
</body></html>
