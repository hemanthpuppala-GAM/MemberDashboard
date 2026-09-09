<?php

namespace App\Mail\Admin\Concerns;

/** Shared plain-HTML layout for the admin notification mailables — no Blade view needed. */
trait BuildsNotificationHtml
{
    private function htmlTable(array $rows): string
    {
        $body = '';

        foreach ($rows as $label => $value) {
            $value = ($value !== null && $value !== '')
                ? nl2br(e((string) $value))
                : '<em>—</em>';

            $body .= '<tr>'
                .'<td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top;"><strong>'.e($label).'</strong></td>'
                .'<td style="padding:4px 0;">'.$value.'</td>'
                .'</tr>';
        }

        return '<table cellpadding="0" cellspacing="0">'.$body.'</table>';
    }

    private function wrap(string $heading, string $tableHtml): string
    {
        return '<div style="font-family:sans-serif;font-size:14px;color:#111827;">'
            .'<h2 style="margin:0 0 12px;">'.e($heading).'</h2>'
            .$tableHtml
            .'</div>';
    }
}
