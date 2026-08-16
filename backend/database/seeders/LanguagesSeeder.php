<?php

namespace Database\Seeders;

use App\Models\Languages\Language;
use Illuminate\Database\Seeder;

class LanguagesSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['name' => 'English', 'native_name' => 'English', 'code' => 'en', 'direction' => 'ltr', 'is_enabled' => true, 'is_default' => true],
            ['name' => 'Hindi', 'native_name' => 'हिन्दी', 'code' => 'hi', 'direction' => 'ltr', 'is_enabled' => true, 'is_default' => false],
            ['name' => 'Spanish', 'native_name' => 'Español', 'code' => 'es', 'direction' => 'ltr', 'is_enabled' => true, 'is_default' => false],
            ['name' => 'Arabic', 'native_name' => 'العربية', 'code' => 'ar', 'direction' => 'rtl', 'is_enabled' => false, 'is_default' => false],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(['code' => $language['code']], $language);
        }
    }
}
