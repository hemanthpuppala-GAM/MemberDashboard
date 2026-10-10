<!doctype html>
<html><body style="margin:0;background:#F3EAD3;font-family:Arial,sans-serif;color:#14241C">
<div style="max-width:560px;margin:0 auto;padding:28px 22px">
  <p style="font-size:15px">Namaste {{ $name }},</p>
  @if ($kind === 'resolved')
    <p style="font-size:15px;line-height:1.6">Your question <strong>{{ $ticket->ref }}</strong> — “{{ $ticket->subject }}” — has been marked as resolved.</p>
    <p style="font-size:15px;line-height:1.6">If anything is still unclear, just reply on the page below and it will reopen. We would also be grateful if you rate how we did.</p>
  @else
    <p style="font-size:15px;line-height:1.6">Our support team replied to your question <strong>{{ $ticket->ref }}</strong>:</p>
    <blockquote style="margin:14px 0;padding:12px 16px;background:#FFFDF8;border-left:3px solid #C9A24A;border-radius:8px;font-size:15px;line-height:1.6;white-space:pre-line">{{ $reply }}</blockquote>
  @endif
  <p style="margin:22px 0"><a href="{{ $url }}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14241C;color:#E8CF83;text-decoration:none;font-weight:bold">Open my question</a></p>
  <p style="font-size:13px;color:#5A5546">Golden Age Wisdom seva team</p>
</div>
</body></html>
