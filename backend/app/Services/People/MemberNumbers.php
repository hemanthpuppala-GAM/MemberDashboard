<?php

namespace App\Services\People;

use App\Models\People\Member;
use App\Models\Support\SupportAgent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * GAW-nnnnnn member numbers — the same scheme as the live site's Supabase `gaw_signup`:
 * sequential from 100001, skipping reserved (ceremonial) seats; 111111 and above are never
 * reached by the sequence. A reserved seat with an email goes to that email's member.
 */
class MemberNumbers
{
    public const FIRST = 100001;

    public const CEILING = 111111;

    private static ?bool $ready = null;

    /** False until the member-number migration has run (deploys don't migrate automatically). */
    public static function ready(): bool
    {
        return self::$ready ??= Schema::hasColumn('members', 'member_num');
    }

    public static function format(?int $num): ?string
    {
        return $num ? 'GAW-'.$num : null;
    }

    /** "GAW-100023", "gaw 100023" or "100023" → 100023. */
    public static function parse(?string $value): ?int
    {
        $digits = preg_replace('/\D+/', '', (string) $value);

        return strlen($digits) === 6 ? (int) $digits : null;
    }

    public static function phoneKey(?string $phone): ?string
    {
        $key = SupportAgent::normalizePhone($phone);

        return $key && strlen($key) >= 8 && strlen($key) <= 15 ? $key : null;
    }

    /** The number this member should get: their reserved seat, else the next free one. */
    public static function numberFor(Member $member): int
    {
        if ($member->email) {
            $seat = DB::table('reserved_member_numbers')->whereRaw('lower(email) = ?', [strtolower($member->email)])->first();
            if ($seat && ! Member::withTrashed()->where('member_num', $seat->member_num)->exists()) {
                $member->role_title ??= $seat->role ?: null;

                return (int) $seat->member_num;
            }
        }

        return self::next();
    }

    public static function next(): int
    {
        $max = (int) Member::withTrashed()->where('member_num', '<', self::CEILING)->max('member_num');
        $next = max(self::FIRST, $max + 1);
        $reserved = DB::table('reserved_member_numbers')->pluck('member_num')->map(fn ($n) => (int) $n)->all();
        while (in_array($next, $reserved, true) || Member::withTrashed()->where('member_num', $next)->exists()) {
            $next++;
        }

        return $next;
    }
}
