<?php

namespace App\Console\Commands;

use App\Models\Engage\RegistrationForm;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Sets the Vasavi Brindavanam survey (Admin → Registration Forms, link /register/vasavi-survey) to the team's
 * questions, so nobody has to type them in. Replaces the form's questions only while it has no answers.
 */
class VasaviSurvey extends Command
{
    protected $signature = 'forms:vasavi-survey {--slug=vasavi-survey}';

    protected $description = 'Load the team\'s Vasavi Brindavanam survey questions into the registration form';

    private const YES_NO = ['Yes', 'No'];

    /** [label, type, required, options] — the team's sheet, in order. */
    private function questions(): array
    {
        return [
            ['I am meditating', 'radio', true, self::YES_NO],
            ['I am enjoying meditation', 'radio', true, self::YES_NO],
            ['What inspires me to meditate?', 'textarea', false, []],
            ['The 41 days meditation program benefitted a lot', 'radio', false, self::YES_NO],
            ['What interested you the most during the 41 days meditation program?', 'textarea', false, []],
            ['I have some questions around meditation', 'radio', false, self::YES_NO],
            ['If yes, what are your questions?', 'textarea', false, []],
            ['I prefer meditating in the Meditation hall than at home', 'radio', false, self::YES_NO],
            ['I am meditating for the following reasons', 'checkboxes', false, ['Health benefits', 'Peace', 'Reducing stress', 'Improved focus and concentration', 'Interest in spirituality', 'World peace', 'Any other']],
            ['I prefer group meditation', 'radio', false, self::YES_NO],
            ['I find the Golden Age wisdom shared in the YouTube channel very useful', 'radio', false, self::YES_NO],
            ['I am aware that meditation will help my surroundings to form a better and healthy community', 'radio', false, self::YES_NO],
            ['Any suggestions you would like to provide?', 'textarea', false, []],
            ['I want to start my meditation journey but I am unable to, due to', 'checkboxes', false, ['Timings', 'Work and other commitments', 'Personal reasons', "Couldn't maintain routine", "I wasn't sure what to expect", 'I preferred meditating at home', "I don't connect to meditation much"]],
            ['I need guidance and support to start my meditation journey', 'radio', false, self::YES_NO],
            ['I am unable to sit for meditation although I tried', 'radio', false, self::YES_NO],
            ['What change could help you to participate?', 'textarea', false, []],
            ["I don't know much about meditation and would like to know more", 'radio', false, ['Yes', 'NA']],
            ['Anything that you would like to share about your journey and experiences?', 'textarea', false, []],
            ['Did meditation help you in your daily life situations?', 'radio', false, self::YES_NO],
        ];
    }

    public function handle(): int
    {
        $slug = (string) $this->option('slug');
        $form = RegistrationForm::firstOrNew(['slug' => $slug]);
        if ($form->exists && $form->submissions()->exists()) {
            $this->error("\"{$form->title}\" already has answers — its questions were left as they are. Edit them in Admin → Registration Forms.");

            return self::FAILURE;
        }

        DB::transaction(function () use ($form) {
            $form->fill([
                'title' => $form->title ?: 'Vasavi Brindavanam Meditation Survey',
                'description' => 'Please be true to yourself and fill in the details :)',
                'status' => 'published',
                'submit_label' => 'Submit',
                'success_message' => 'Thank you for being part of the Vasavi Brindavanam gathering and for sharing your journey with us. 🙏',
                'members_only' => true,
            ])->save();

            $form->fields()->delete();
            foreach ($this->questions() as $i => [$label, $type, $required, $options]) {
                $form->fields()->create([
                    'label' => $label,
                    'field_key' => 'q'.str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                    'type' => $type,
                    'is_required' => $required,
                    'options' => $options ?: null,
                    'sort_order' => $i,
                ]);
            }
        });

        $this->info(count($this->questions())." questions loaded into \"{$form->title}\" (members only, published): /register/{$slug}");

        return self::SUCCESS;
    }
}
