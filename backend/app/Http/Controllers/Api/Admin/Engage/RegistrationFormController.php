<?php

namespace App\Http\Controllers\Api\Admin\Engage;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Engage\RegistrationFormRequest;
use App\Models\Engage\RegistrationForm;
use Illuminate\Support\Facades\DB;

class RegistrationFormController extends Controller
{
    public function index()
    {
        return response()->json(
            RegistrationForm::withCount('submissions')->latest()->get(),
        );
    }

    public function show(RegistrationForm $registrationForm)
    {
        return response()->json($registrationForm->load('fields'));
    }

    public function store(RegistrationFormRequest $request)
    {
        $form = DB::transaction(function () use ($request) {
            $form = RegistrationForm::create([
                ...$request->safe()->except('fields'),
                'created_by' => $request->user()->id,
            ]);

            $this->syncFields($form, $request->input('fields', []));

            return $form;
        });

        return response()->json($form->load('fields'), 201);
    }

    public function update(RegistrationFormRequest $request, RegistrationForm $registrationForm)
    {
        DB::transaction(function () use ($request, $registrationForm) {
            $registrationForm->update($request->safe()->except('fields'));

            $this->syncFields($registrationForm, $request->input('fields', []));
        });

        return response()->json($registrationForm->fresh()->load('fields'));
    }

    public function destroy(RegistrationForm $registrationForm)
    {
        $registrationForm->delete();

        return response()->json(null, 204);
    }

    /** Full replace: the editor always submits the complete field list, so drop whatever isn't in it and upsert the rest in order. */
    private function syncFields(RegistrationForm $form, array $fields): void
    {
        $form->fields()->whereNotIn('field_key', array_column($fields, 'field_key'))->delete();

        foreach ($fields as $index => $field) {
            $form->fields()->updateOrCreate(
                ['field_key' => $field['field_key']],
                [
                    'label' => $field['label'],
                    'type' => $field['type'],
                    'is_required' => $field['is_required'] ?? false,
                    'options' => $field['options'] ?? null,
                    'placeholder' => $field['placeholder'] ?? null,
                    'sort_order' => $index,
                ],
            );
        }
    }
}
