<?php

use App\Http\Controllers\Api\Admin\Engage\AnnouncementController;
use App\Http\Controllers\Api\Admin\Engage\BroadcastController as AdminBroadcastController;
use App\Http\Controllers\Api\Admin\Content\ContactChannelController as AdminContactChannelController;
use App\Http\Controllers\Api\Admin\Content\VolunteerCategoryController as AdminVolunteerCategoryController;
use App\Http\Controllers\Api\Admin\People\ContactSubmissionController;
use App\Http\Controllers\Api\Admin\People\VolunteerApplicationController as AdminVolunteerApplicationController;
use App\Http\Controllers\Api\Admin\Cms\ContentController as AdminContentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\Content\DonationMethodController as AdminDonationMethodController;
use App\Http\Controllers\Api\Admin\Cms\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\Languages\LanguageController as AdminLanguageController;
use App\Http\Controllers\Api\Admin\Cms\MediaController;
use App\Http\Controllers\Api\Admin\People\MemberController;
use App\Http\Controllers\Api\Admin\People\MemberJourneyController;
use App\Http\Controllers\Api\Admin\Content\MusicController as AdminMusicController;
use App\Http\Controllers\Api\Admin\Content\SitPresetController as AdminSitPresetController;
use App\Http\Controllers\Api\Admin\Cms\PageController as AdminPageController;
use App\Http\Controllers\Api\Admin\Auth\PermissionController;
use App\Http\Controllers\Api\Admin\Engage\QrCodeController;
use App\Http\Controllers\Api\Admin\Reports\ReportController;
use App\Http\Controllers\Api\Admin\Auth\RoleController;
use App\Http\Controllers\Api\Admin\Cms\SectionContentController;
use App\Http\Controllers\Api\Admin\Cms\SectionController;
use App\Http\Controllers\Api\Admin\Settings\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\Content\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Api\Admin\Auth\UserController;
use App\Http\Controllers\Api\Public\Auth\AuthController;
use App\Http\Controllers\Api\Public\Auth\MemberAuthController;
use App\Http\Controllers\Api\Public\Member\JournalController;
use App\Http\Controllers\Api\Public\Member\LiveSessionController;
use App\Http\Controllers\Api\Public\Member\OverviewController as MemberOverviewController;
use App\Http\Controllers\Api\Public\Member\PracticeSessionController;
use App\Http\Controllers\Api\Public\Member\ProfileController as MemberProfileController;
use App\Http\Controllers\Api\Public\Member\ReferralController;
use App\Http\Controllers\Api\Public\Engage\BroadcastController;
use App\Http\Controllers\Api\Public\Content\ContactChannelController;
use App\Http\Controllers\Api\Public\Content\VolunteerCategoryController;
use App\Http\Controllers\Api\Public\People\ContactController;
use App\Http\Controllers\Api\Public\People\VolunteerApplicationController;
use App\Http\Controllers\Api\Public\Cms\ContentController;
use App\Http\Controllers\Api\Public\Content\DonationMethodController;
use App\Http\Controllers\Api\Public\Cms\EventController;
use App\Http\Controllers\Api\Public\Languages\LanguageController;
use App\Http\Controllers\Api\Public\Content\MusicController;
use App\Http\Controllers\Api\Public\Content\SitPresetController;
use App\Http\Controllers\Api\Public\Cms\PageController;
use App\Http\Controllers\Api\Practitioner\PractitionerController;
use App\Http\Controllers\Api\Public\Settings\SettingController;
use App\Http\Controllers\Api\Public\Content\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // ---- Public, read-only ----

    // Legacy flat content blocks (page_contents) — kept working alongside the
    // newer pages/sections system below; see ADMIN_PANEL_PLAN.md §16 and
    // BACKEND_DB_API_PLAN.md for why both exist for now.
    Route::get('/content', [ContentController::class, 'index']);
    Route::get('/content/{slug}', [ContentController::class, 'show']);

    Route::get('/pages/{slug}', [PageController::class, 'show']);
    Route::get('/languages/enabled', [LanguageController::class, 'enabled']);
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/music', [MusicController::class, 'index']);
    Route::get('/sit-presets', [SitPresetController::class, 'index']);
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::get('/testimonials/featured', [TestimonialController::class, 'featured']);
    Route::get('/contact-channels', [ContactChannelController::class, 'index']);
    Route::get('/donation-methods', [DonationMethodController::class, 'index']);
    Route::get('/broadcasts/active', [BroadcastController::class, 'active']);
    Route::get('/volunteer-categories', [VolunteerCategoryController::class, 'index']);

    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
    Route::post('/volunteer-applications', [VolunteerApplicationController::class, 'store'])->middleware('throttle:5,1');

    // ---- Member auth (public sign-up / sign-in, e.g. /join) ----
    Route::post('/auth/register', [MemberAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [MemberAuthController::class, 'login'])->middleware('throttle:10,1');
    Route::middleware(['auth:sanctum', 'member'])->group(function () {
        Route::post('/auth/logout', [MemberAuthController::class, 'logout']);
        Route::get('/auth/me', [MemberAuthController::class, 'me']);

        Route::prefix('member')->group(function () {
            Route::get('/overview', [MemberOverviewController::class, 'index']);
            Route::get('/practice-sessions', [PracticeSessionController::class, 'index']);
            Route::post('/practice-sessions', [PracticeSessionController::class, 'store']);
            Route::get('/journal', [JournalController::class, 'index']);
            Route::post('/journal', [JournalController::class, 'store']);
            Route::put('/journal/{journalEntry}', [JournalController::class, 'update']);
            Route::delete('/journal/{journalEntry}', [JournalController::class, 'destroy']);
            Route::get('/live-sessions', [LiveSessionController::class, 'index']);
            Route::get('/referral', [ReferralController::class, 'index']);
            Route::put('/profile', [MemberProfileController::class, 'update']);
            Route::put('/password', [MemberProfileController::class, 'updatePassword']);
        });
    });

    // ---- Admin auth ----
    Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/permissions', [PermissionController::class, 'index']);

        // ---- Legacy flat content blocks ----
        Route::middleware('permission:cms.view')->get('/content', [AdminContentController::class, 'index']);
        Route::middleware('permission:cms.edit')->put('/content/{slug}', [AdminContentController::class, 'update']);

        // ---- CMS: Pages / Sections / Content ----
        Route::middleware('permission:cms.view')->group(function () {
            Route::get('/pages', [AdminPageController::class, 'index']);
            Route::get('/pages/{page:slug}', [AdminPageController::class, 'show']);
            Route::get('/pages/{page:slug}/sections', [SectionController::class, 'index']);
            Route::get('/sections/{section}/content', [SectionContentController::class, 'index']);
        });
        Route::middleware('permission:cms.create')->group(function () {
            Route::post('/pages', [AdminPageController::class, 'store']);
            Route::post('/pages/{page:slug}/sections', [SectionController::class, 'store']);
        });
        Route::middleware('permission:cms.edit')->group(function () {
            Route::put('/pages/{page:slug}', [AdminPageController::class, 'update']);
            Route::patch('/pages/{page:slug}/status', [AdminPageController::class, 'updateStatus']);
            Route::put('/pages/{page:slug}/sections/reorder', [SectionController::class, 'reorder']);
            Route::put('/pages/{page:slug}/sections/{section}', [SectionController::class, 'update']);
            Route::put('/sections/{section}/content', [SectionContentController::class, 'update']);
        });
        Route::middleware('permission:cms.delete')->group(function () {
            Route::delete('/pages/{page:slug}', [AdminPageController::class, 'destroy']);
            Route::delete('/pages/{page:slug}/sections/{section}', [SectionController::class, 'destroy']);
        });

        // ---- Media ----
        Route::middleware('permission:cms.view')->get('/media', [MediaController::class, 'index']);
        Route::middleware('permission:cms.create')->post('/media', [MediaController::class, 'store']);
        Route::middleware('permission:cms.edit')->put('/media/{media}', [MediaController::class, 'update']);
        Route::middleware('permission:cms.delete')->delete('/media/{media}', [MediaController::class, 'destroy']);

        // ---- Music ----
        Route::middleware('permission:music.view')->get('/music', [AdminMusicController::class, 'index']);
        Route::middleware('permission:music.create')->post('/music', [AdminMusicController::class, 'store']);
        Route::middleware('permission:music.edit')->group(function () {
            Route::put('/music/reorder', [AdminMusicController::class, 'reorder']);
            Route::put('/music/{music}', [AdminMusicController::class, 'update']);
        });
        Route::middleware('permission:music.delete')->delete('/music/{music}', [AdminMusicController::class, 'destroy']);

        // ---- Sit presets (Sit & Scribe session templates) ----
        Route::middleware('permission:music.view')->get('/sit-presets', [AdminSitPresetController::class, 'index']);
        Route::middleware('permission:music.create')->post('/sit-presets', [AdminSitPresetController::class, 'store']);
        Route::middleware('permission:music.edit')->group(function () {
            Route::put('/sit-presets/reorder', [AdminSitPresetController::class, 'reorder']);
            Route::put('/sit-presets/{sitPreset}', [AdminSitPresetController::class, 'update']);
        });
        Route::middleware('permission:music.delete')->delete('/sit-presets/{sitPreset}', [AdminSitPresetController::class, 'destroy']);

        // ---- Testimonials ----
        Route::middleware('permission:testimonials.view')->get('/testimonials', [AdminTestimonialController::class, 'index']);
        Route::middleware('permission:testimonials.create')->post('/testimonials', [AdminTestimonialController::class, 'store']);
        Route::middleware('permission:testimonials.edit')->put('/testimonials/{testimonial}', [AdminTestimonialController::class, 'update']);
        Route::middleware('permission:testimonials.delete')->delete('/testimonials/{testimonial}', [AdminTestimonialController::class, 'destroy']);

        // ---- Contact channels ----
        Route::middleware('permission:contact_channels.view')->get('/contact-channels', [AdminContactChannelController::class, 'index']);
        Route::middleware('permission:contact_channels.create')->post('/contact-channels', [AdminContactChannelController::class, 'store']);
        Route::middleware('permission:contact_channels.edit')->group(function () {
            Route::put('/contact-channels/reorder', [AdminContactChannelController::class, 'reorder']);
            Route::put('/contact-channels/{contactChannel}', [AdminContactChannelController::class, 'update']);
        });
        Route::middleware('permission:contact_channels.delete')->delete('/contact-channels/{contactChannel}', [AdminContactChannelController::class, 'destroy']);

        // ---- Volunteer categories ----
        Route::middleware('permission:volunteers.view')->get('/volunteer-categories', [AdminVolunteerCategoryController::class, 'index']);
        Route::middleware('permission:volunteers.create')->post('/volunteer-categories', [AdminVolunteerCategoryController::class, 'store']);
        Route::middleware('permission:volunteers.edit')->group(function () {
            Route::put('/volunteer-categories/reorder', [AdminVolunteerCategoryController::class, 'reorder']);
            Route::put('/volunteer-categories/{volunteerCategory}', [AdminVolunteerCategoryController::class, 'update']);
        });
        Route::middleware('permission:volunteers.delete')->delete('/volunteer-categories/{volunteerCategory}', [AdminVolunteerCategoryController::class, 'destroy']);

        // ---- Volunteer applications ----
        Route::middleware('permission:volunteers.view')->group(function () {
            Route::get('/volunteer-applications', [AdminVolunteerApplicationController::class, 'index']);
            Route::get('/volunteer-applications/{volunteerApplication}', [AdminVolunteerApplicationController::class, 'show']);
        });
        Route::middleware('permission:volunteers.edit')->patch('/volunteer-applications/{volunteerApplication}/status', [AdminVolunteerApplicationController::class, 'update']);
        Route::middleware('permission:volunteers.delete')->delete('/volunteer-applications/{volunteerApplication}', [AdminVolunteerApplicationController::class, 'destroy']);

        // ---- Donation methods ----
        Route::middleware('permission:donations.view')->get('/donation-methods', [AdminDonationMethodController::class, 'index']);
        Route::middleware('permission:donations.create')->post('/donation-methods', [AdminDonationMethodController::class, 'store']);
        Route::middleware('permission:donations.edit')->put('/donation-methods/{donationMethod}', [AdminDonationMethodController::class, 'update']);
        Route::middleware('permission:donations.delete')->delete('/donation-methods/{donationMethod}', [AdminDonationMethodController::class, 'destroy']);

        // ---- Events ----
        Route::middleware('permission:cms.view')->get('/events', [AdminEventController::class, 'index']);
        Route::middleware('permission:cms.create')->post('/events', [AdminEventController::class, 'store']);
        Route::middleware('permission:cms.edit')->put('/events/{event}', [AdminEventController::class, 'update']);
        Route::middleware('permission:cms.delete')->delete('/events/{event}', [AdminEventController::class, 'destroy']);

        // ---- Languages ----
        Route::middleware('permission:languages.view')->get('/languages', [AdminLanguageController::class, 'index']);
        Route::middleware('permission:languages.create')->post('/languages', [AdminLanguageController::class, 'store']);
        Route::middleware('permission:languages.edit')->put('/languages/{language}', [AdminLanguageController::class, 'update']);
        Route::middleware('permission:languages.delete')->delete('/languages/{language}', [AdminLanguageController::class, 'destroy']);

        // ---- Users & Roles ----
        Route::middleware('permission:users.view')->get('/users', [UserController::class, 'index']);
        Route::middleware('permission:users.create')->post('/users', [UserController::class, 'store']);
        Route::middleware('permission:users.edit')->put('/users/{user}', [UserController::class, 'update']);
        Route::middleware('permission:users.delete')->delete('/users/{user}', [UserController::class, 'destroy']);

        Route::middleware('permission:roles.view')->get('/roles', [RoleController::class, 'index']);
        Route::middleware('permission:roles.view')->get('/roles/{role}', [RoleController::class, 'show']);
        Route::middleware('permission:roles.create')->post('/roles', [RoleController::class, 'store']);
        Route::middleware('permission:roles.edit')->put('/roles/{role}', [RoleController::class, 'update']);
        Route::middleware('permission:roles.delete')->delete('/roles/{role}', [RoleController::class, 'destroy']);

        // ---- Members ----
        Route::middleware('permission:members.view')->group(function () {
            Route::get('/members/export', [MemberController::class, 'export']);
            Route::get('/members', [MemberController::class, 'index']);
            Route::get('/members/{member}', [MemberController::class, 'show']);
            Route::get('/members/{member}/journey', [MemberJourneyController::class, 'index']);
        });
        Route::middleware('permission:members.edit')->group(function () {
            Route::post('/members', [MemberController::class, 'store']);
            Route::put('/members/{member}', [MemberController::class, 'update']);
            Route::post('/members/{member}/journey', [MemberJourneyController::class, 'store']);
        });
        Route::middleware('permission:members.assign')->post('/members/{member}/assign', [MemberController::class, 'assign']);
        Route::middleware('permission:members.delete')->delete('/members/{member}', [MemberController::class, 'destroy']);

        // ---- Queries ----
        Route::middleware('permission:members.view')->group(function () {
            Route::get('/queries', [ContactSubmissionController::class, 'index']);
            Route::get('/queries/{contactSubmission}', [ContactSubmissionController::class, 'show']);
        });
        Route::middleware('permission:members.edit')->group(function () {
            Route::patch('/queries/{contactSubmission}/status', [ContactSubmissionController::class, 'update']);
            Route::post('/queries/{contactSubmission}/convert-to-member', [ContactSubmissionController::class, 'convertToMember']);
        });
        Route::middleware('permission:members.assign')->patch('/queries/{contactSubmission}/assign', [ContactSubmissionController::class, 'assign']);
        // Legacy path some earlier tooling may still call:
        Route::middleware('permission:members.view')->get('/contact-submissions', [ContactSubmissionController::class, 'index']);
        Route::middleware('permission:members.edit')->patch('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'update']);

        // ---- Announcements ----
        Route::middleware('permission:announcements.view')->get('/announcements', [AnnouncementController::class, 'index']);
        Route::middleware('permission:announcements.create')->post('/announcements', [AnnouncementController::class, 'store']);
        Route::middleware('permission:announcements.edit')->group(function () {
            Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
            Route::post('/announcements/{announcement}/send', [AnnouncementController::class, 'send']);
        });
        Route::middleware('permission:announcements.delete')->delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

        // ---- Broadcasts ----
        Route::middleware('permission:broadcast.view')->get('/broadcasts', [AdminBroadcastController::class, 'index']);
        Route::middleware('permission:broadcast.create')->post('/broadcasts', [AdminBroadcastController::class, 'store']);
        Route::middleware('permission:broadcast.edit')->group(function () {
            Route::put('/broadcasts/{broadcast}', [AdminBroadcastController::class, 'update']);
            Route::patch('/broadcasts/{broadcast}/status', [AdminBroadcastController::class, 'updateStatus']);
        });
        Route::middleware('permission:broadcast.delete')->delete('/broadcasts/{broadcast}', [AdminBroadcastController::class, 'destroy']);

        // ---- QR Codes ----
        Route::middleware('permission:qrcode.view')->get('/qr-codes', [QrCodeController::class, 'index']);
        Route::middleware('permission:qrcode.generate')->post('/qr-codes/generate', [QrCodeController::class, 'generate']);
        Route::middleware('permission:qrcode.view')->get('/qr-codes/{qrCode}/download', [QrCodeController::class, 'download']);
        Route::middleware('permission:qrcode.delete')->delete('/qr-codes/{qrCode}', [QrCodeController::class, 'destroy']);

        // ---- Reports ----
        Route::middleware('permission:reports.view')->group(function () {
            Route::get('/reports/overview', [ReportController::class, 'overview']);
            Route::get('/reports/members', [ReportController::class, 'members']);
            Route::get('/reports/practitioners', [ReportController::class, 'practitioners']);
            Route::get('/reports/queries', [ReportController::class, 'queries']);
            Route::get('/reports/activity-log', [ReportController::class, 'activityLog']);
            Route::get('/reports/export', [ReportController::class, 'export']);
        });

        // ---- Settings ----
        Route::middleware('permission:settings.view')->get('/settings', [AdminSettingController::class, 'index']);
        Route::middleware('permission:settings.edit')->group(function () {
            Route::put('/settings', [AdminSettingController::class, 'update']);
            Route::post('/settings/test-email', [AdminSettingController::class, 'testEmail']);
            Route::post('/settings/clear-cache', [AdminSettingController::class, 'clearCache']);
        });
    });

    // ---- Practitioner (own scope — ownership checked per-row in the controller, not by permission) ----
    Route::middleware(['auth:sanctum', 'admin'])->prefix('practitioner')->group(function () {
        Route::get('/dashboard-stats', [PractitionerController::class, 'dashboardStats']);
        Route::get('/members', [PractitionerController::class, 'members']);
        Route::get('/members/{member}', [PractitionerController::class, 'member']);
        Route::get('/members/{member}/journey', [PractitionerController::class, 'journey']);
        Route::post('/members/{member}/journey', [PractitionerController::class, 'addJourneyEntry']);
        Route::put('/members/{member}/summary', [PractitionerController::class, 'updateSummary']);
        Route::get('/announcements', [PractitionerController::class, 'announcements']);
        Route::patch('/announcements/{announcement}/read', [PractitionerController::class, 'markAnnouncementRead']);
    });
});
