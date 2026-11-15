<?php

/*
 * Golden Age Kids Meditation Circle (USA, online on Zoom).
 * Zoom details are never shown on public pages: only to a parent with a signed consent (My family page + email).
 * Set KIDS_ZOOM_PASSCODE (use a strong one, not 1111) and KIDS_WHATSAPP_LINK in .env on the server.
 */
return [
    'organization' => 'Golden Age Wisdom',
    // Law named in the online consent. In-person waivers use the event's own state (Phase 3).
    'governing_state' => env('KIDS_GOVERNING_STATE', 'Texas'),

    // Session times are kept in Central time; pages show them in the visitor's own time zone too.
    'timezone' => 'America/Chicago',
    'day' => env('KIDS_DAY'), // e.g. "Saturday". Empty = "Weekly".
    // Add a group here (key => label, ages, Central start/end) to open another session; pages, forms,
    // rosters and analytics pick it up.
    'groups' => [
        'elementary' => ['label' => 'Elementary kids', 'ages' => [5, 10], 'start' => '19:00', 'end' => '19:30'],
        'teens' => ['label' => 'Middle and high school kids', 'ages' => [11, 17], 'start' => '20:30', 'end' => '21:00'],
    ],
    'min_age' => 4,
    'max_age' => 17,
    'max_children' => 4,

    'zoom_id' => env('KIDS_ZOOM_ID', '858 3986 9813'),
    'zoom_passcode' => env('KIDS_ZOOM_PASSCODE'),
    'zoom_link' => env('KIDS_ZOOM_LINK'),
    'whatsapp_link' => env('KIDS_WHATSAPP_LINK'),
    // US questions line for parents. Digits only (E.164 without '+').
    'phone' => env('KIDS_PHONE', '15125776712'),
    'email' => env('KIDS_EMAIL', 'goldenageguruteachings@gmail.com'),
];
