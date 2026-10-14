<?php

namespace App\Services\People;

use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\People\MemberJournalEntry;
use App\Models\People\MemberJourney;
use App\Models\People\PracticeSession;
use App\Models\People\VolunteerApplication;
use App\Models\Support\Ticket;
use Illuminate\Support\Facades\DB;

/**
 * Keeps one person = one Member across every way they reach us: Google sign-in (email),
 * volunteer form (email + phone), membership drives and support calls (phone only).
 *
 * Matching rule: email first; a phone number only matches a member who has no email yet
 * (two family members can share a phone, never an email).
 */
class MemberLinker
{
    public static function find(?string $email, ?string $phone): ?Member
    {
        $email = self::cleanEmail($email);
        if ($email && ($m = Member::whereRaw('lower(email) = ?', [$email])->first())) {
            return $m;
        }
        $key = MemberNumbers::phoneKey($phone);
        if ($key) {
            $q = Member::where('phone_key', $key)->orderBy('id');

            return $email ? $q->whereNull('email')->first() : $q->first();
        }

        return null;
    }

    /**
     * Find the member for these details or create one. Blank details on an existing
     * member are filled in; nothing already set is overwritten.
     *
     * @return array{0: Member, 1: bool} [member, created]
     */
    public static function findOrCreate(array $details, string $source, ?int $driveId = null): array
    {
        $email = self::cleanEmail($details['email'] ?? null);
        $phone = trim((string) ($details['phone'] ?? '')) ?: null;
        $name = trim((string) ($details['name'] ?? ''));

        $member = self::find($email, $phone);
        if ($member) {
            $fill = array_filter([
                'name' => $member->name ? null : $name,
                'email' => $member->email ? null : $email,
                'phone' => $member->phone ? null : $phone,
            ]);
            if ($fill) {
                $member->fill($fill)->save();
            }

            return [$member, false];
        }

        $member = Member::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'category' => 'general',
            'status' => 'active',
            'join_date' => $details['join_date'] ?? now()->toDateString(),
            'source' => $source,
            'drive_id' => $driveId,
        ]);

        return [$member, true];
    }

    /** Attach unlinked tickets, volunteer sign-ups and queries that belong to this member. */
    public static function adoptRecords(Member $member): void
    {
        $email = self::cleanEmail($member->email);
        $key = $member->phone_key;
        if (! $email && ! $key) {
            return;
        }

        if ($email) {
            Ticket::whereNull('member_id')->whereRaw('lower(requester_email) = ?', [$email])->update(['member_id' => $member->id]);
            ContactSubmission::whereNull('member_id')->whereRaw('lower(email) = ?', [$email])->update(['member_id' => $member->id]);
            VolunteerApplication::whereNull('member_id')->whereRaw('lower(email) = ?', [$email])
                ->update(['member_id' => $member->id, 'member_num' => $member->member_num]);
        }

        // Phone matches only for members without an email (see class note), and only
        // records that don't carry a different email.
        if ($key && ! $email) {
            Ticket::whereNull('member_id')->whereNotNull('requester_phone')->whereNull('requester_email')
                ->get(['id', 'requester_phone'])
                ->filter(fn (Ticket $t) => MemberNumbers::phoneKey($t->requester_phone) === $key)
                ->each(fn (Ticket $t) => $t->forceFill(['member_id' => $member->id])->saveQuietly());
        }
    }

    /** A new ticket finds its member by email or phone. */
    public static function memberIdForTicket(Ticket $ticket): ?int
    {
        return self::find($ticket->requester_email, $ticket->requester_phone)?->id;
    }

    /**
     * Fold a duplicate into the member we keep — e.g. someone added at a drive by phone who
     * later signs in with Google and enters the same phone. The older member number wins,
     * because that's the one the person was given first.
     */
    public static function merge(Member $keep, Member $gone): Member
    {
        if ($keep->is($gone)) {
            return $keep;
        }

        return DB::transaction(function () use ($keep, $gone) {
            foreach ([Ticket::class, VolunteerApplication::class, MemberJournalEntry::class, PracticeSession::class, MemberJourney::class, ContactSubmission::class] as $model) {
                $model::where('member_id', $gone->id)->update(['member_id' => $keep->id]);
            }

            $num = $keep->member_num;
            if ($gone->member_num && (! $num || $gone->member_num < $num)) {
                $num = $gone->member_num;
            }
            $goneNum = $gone->member_num;
            $gone->forceFill(['member_num' => null])->saveQuietly();
            $gone->delete();

            $keep->forceFill(array_filter([
                'member_num' => $num,
                'phone' => $keep->phone ?: $gone->phone,
                'phone_key' => $keep->phone_key ?: $gone->phone_key,
                'drive_id' => $keep->drive_id ?: $gone->drive_id,
                'role_title' => $keep->role_title ?: $gone->role_title,
                'join_date' => $gone->join_date && $keep->join_date && $gone->join_date->lt($keep->join_date) ? $gone->join_date : null,
            ]))->save();

            VolunteerApplication::where('member_id', $keep->id)->update(['member_num' => $keep->member_num]);
            if ($goneNum && $goneNum !== $keep->member_num) {
                VolunteerApplication::where('member_num', $goneNum)->update(['member_num' => $keep->member_num]);
            }

            return $keep;
        });
    }

    /** If a phone-only member (e.g. from a drive) has this member's phone, fold it in. */
    public static function absorbPhoneTwin(Member $member): ?Member
    {
        if (! $member->phone_key) {
            return null;
        }
        $twin = Member::where('phone_key', $member->phone_key)
            ->where('id', '!=', $member->id)
            ->whereNull('email')
            ->whereNull('oauth_provider')
            ->whereNull('password')
            ->orderBy('id')
            ->first();

        return $twin ? self::merge($member, $twin) : null;
    }

    private static function cleanEmail(?string $email): ?string
    {
        $email = strtolower(trim((string) $email));

        return $email !== '' && str_contains($email, '@') ? $email : null;
    }
}
