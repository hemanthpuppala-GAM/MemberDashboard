<?php

namespace App\Http\Controllers\Api\Admin\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\SettingUpdateRequest;
use App\Models\Settings\Setting;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{
    public function index()
    {
        $flat = array_merge(Setting::DEFAULTS, Setting::pluck('value', 'key')->toArray());

        foreach (Setting::WRITE_ONLY_KEYS as $key) {
            unset($flat[$key]);
        }

        return response()->json($this->group($flat));
    }

    public function update(SettingUpdateRequest $request)
    {
        foreach ($this->flatten($request->validated('settings')) as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return $this->index();
    }

    public function testEmail()
    {
        try {
            Mail::raw('This is a test email from the Golden Age Wisdom admin panel.', function ($message) {
                $message->to(Setting::where('key', 'general.admin_email')->value('value') ?? Setting::DEFAULTS['general.admin_email'])
                    ->subject('Test email');
            });
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Could not send test email: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent (check MAIL_MAILER driver — defaults to log in dev).']);
    }

    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');

        return response()->json(['message' => 'Cache cleared.']);
    }

    private function group(array $flat): array
    {
        $grouped = [];
        foreach ($flat as $key => $value) {
            [$group, $field] = explode('.', $key, 2);
            $grouped[$group][$this->camel($field)] = $value;
        }

        return $grouped;
    }

    private function flatten(array $nested): array
    {
        $flat = [];
        foreach ($nested as $group => $fields) {
            foreach ($fields as $field => $value) {
                $flat["{$group}.".$this->snake($field)] = is_bool($value) ? ($value ? 'true' : 'false') : $value;
            }
        }

        return $flat;
    }

    private function camel(string $snake): string
    {
        return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $snake))));
    }

    private function snake(string $camel): string
    {
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $camel));
    }
}
