Namaste {{ $name }},

@if ($kind === 'resolved')
Your question {{ $ticket->ref }} — "{{ $ticket->subject }}" — has been marked as resolved.
If anything is still unclear, reply on the page below and it will reopen. Please rate how we did.
@else
Our support team replied to your question {{ $ticket->ref }}:

{{ $reply }}
@endif

Open my question: {{ $url }}

Golden Age Wisdom seva team
