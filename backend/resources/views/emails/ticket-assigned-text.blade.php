Namaste {{ $name }},

{{ $by }} assigned ticket {{ $ticket->ref }} to you{{ $ticket->priority === 'urgent' ? ' (marked urgent)' : '' }}.

{{ $from }} asked:
"{{ $ticket->subject }}"

{{ $question }}

Open the ticket: {{ $url }}
Reply to the member there, or add an internal note for the team.

Golden Age Wisdom support desk
