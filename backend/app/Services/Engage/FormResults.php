<?php

namespace App\Services\Engage;

use App\Models\Engage\RegistrationForm;
use App\Models\Engage\RegistrationFormField;
use App\Models\Engage\RegistrationFormSubmission;
use Illuminate\Support\Collection;

/**
 * A form's answers summed up per question for the admin Results page: counts per choice (bars), the "Any
 * other" texts, written answers to read through, and responses per day. Optionally only the people who gave
 * one answer to one question ("I am meditating" = No), to see what those people said everywhere else.
 */
class FormResults
{
    private const MAX_TEXTS = 300;

    public static function for(RegistrationForm $form, ?string $filterField = null, ?string $filterValue = null): array
    {
        $fields = $form->fields;
        $all = $form->submissions()->orderByDesc('created_at')->get(['id', 'data', 'created_at']);
        $rows = $filterField && $filterValue !== null && $filterValue !== ''
            ? $all->filter(fn ($s) => self::matches($s->data[$filterField] ?? null, $filterValue))->values()
            : $all;

        return [
            'total' => $all->count(),
            'matching' => $rows->count(),
            'filter' => $filterField ? ['field' => $filterField, 'value' => $filterValue] : null,
            'per_day' => self::perDay($rows),
            'questions' => $fields->map(fn (RegistrationFormField $f) => self::question($f, $rows))->values()->all(),
        ];
    }

    /** One answer: a choice, a ticked choice in a list, or "Any other: …" for its "Any other" choice. */
    private static function matches(mixed $answer, string $value): bool
    {
        if (is_bool($answer)) {
            return ($answer ? 'Yes' : 'No') === $value;
        }
        if (is_array($answer)) {
            return collect($answer)->contains(fn ($a) => $a === $value || str_starts_with((string) $a, $value.': '));
        }

        return (string) $answer === $value;
    }

    private static function question(RegistrationFormField $f, Collection $rows): array
    {
        $answers = $rows->map(fn (RegistrationFormSubmission $s) => ['value' => $s->data[$f->field_key] ?? null, 'at' => $s->created_at]);
        $base = ['key' => $f->field_key, 'label' => $f->label, 'type' => $f->type];

        if ($f->type === 'checkbox') {
            $yes = $answers->filter(fn ($a) => $a['value'] === true)->count();

            return $base + ['kind' => 'choice', 'answered' => $answers->count(), 'counts' => [['option' => 'Yes', 'count' => $yes], ['option' => 'No', 'count' => $answers->count() - $yes]]];
        }

        if (in_array($f->type, RegistrationFormField::CHOICE_TYPES, true)) {
            $multi = $f->type === 'checkboxes';
            $options = (array) ($f->options ?? []);
            $counts = array_fill_keys($options, 0);
            $others = [];
            $answered = 0;
            foreach ($answers as $a) {
                $picked = $multi ? (array) ($a['value'] ?? []) : (filled($a['value']) ? [$a['value']] : []);
                if ($picked) {
                    $answered++;
                }
                foreach ($picked as $p) {
                    $p = (string) $p;
                    // "Any other: better sleep" counts under "Any other"; the text is listed separately.
                    $option = collect($options)->first(fn ($o) => $p === $o || str_starts_with($p, $o.': ')) ?? $p;
                    $counts[$option] = ($counts[$option] ?? 0) + 1;
                    if ($option !== $p && str_starts_with($p, $option.': ')) {
                        $others[] = trim(substr($p, strlen($option) + 2));
                    }
                }
            }
            $list = collect($counts)->map(fn ($n, $o) => ['option' => (string) $o, 'count' => $n])->values();
            if ($multi) {
                $list = $list->sortByDesc('count')->values(); // tick-all: most picked first
            }

            return $base + ['kind' => 'choice', 'multi' => $multi, 'answered' => $answered, 'counts' => $list->all(), 'others' => $others];
        }

        $texts = $answers->filter(fn ($a) => filled($a['value']))->values();

        return $base + [
            'kind' => 'text',
            'answered' => $texts->count(),
            'answers' => $texts->take(self::MAX_TEXTS)->map(fn ($a) => ['text' => (string) $a['value'], 'at' => $a['at']])->all(),
        ];
    }

    /** Responses per day, from the first response to today (at most the last 60 days). */
    private static function perDay(Collection $rows): array
    {
        if ($rows->isEmpty()) {
            return [];
        }
        $byDay = $rows->countBy(fn ($s) => $s->created_at->toDateString());
        $start = max($rows->min('created_at')->copy()->startOfDay(), now()->subDays(59)->startOfDay());
        $days = [];
        for ($d = $start->copy(); $d->lte(now()); $d->addDay()) {
            $days[] = ['date' => $d->toDateString(), 'count' => $byDay[$d->toDateString()] ?? 0];
        }

        return $days;
    }
}
