<?php

namespace Database\Seeders;

use App\Models\Auth\Permission;
use App\Models\Auth\Role;
use Illuminate\Database\Seeder;

/**
 * Seeds permissions + the four built-in roles, matching PERMISSION_GROUPS /
 * ROLES in frontend/src/admin/mock/mockData.js. Wildcard entries in that
 * mock ("cms.*", or "all" for super_admin) are expanded here into concrete
 * role_permissions rows — see BACKEND_DB_API_PLAN.md §5.
 */
class RolesAndPermissionsSeeder extends Seeder
{
    private const GROUPS = [
        'cms' => ['view', 'create', 'edit', 'delete'],
        'languages' => ['view', 'create', 'edit', 'delete'],
        'users' => ['view', 'create', 'edit', 'delete'],
        'roles' => ['view', 'create', 'edit', 'delete'],
        'members' => ['view', 'edit', 'assign', 'delete'],
        'reports' => ['view'],
        'announcements' => ['view', 'create', 'edit', 'delete'],
        'broadcast' => ['view', 'create', 'edit', 'delete'],
        'qrcode' => ['view', 'generate', 'delete'],
        'settings' => ['view', 'edit'],
        'music' => ['view', 'create', 'edit', 'delete'],
        'testimonials' => ['view', 'create', 'edit', 'delete'],
        'contact_channels' => ['view', 'create', 'edit', 'delete'],
        'donations' => ['view', 'create', 'edit', 'delete'],
    ];

    private const ROLES = [
        [
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Everything. Can create other admins, manage roles.',
            'permissions' => ['*'],
        ],
        [
            'name' => 'admin',
            'display_name' => 'Admin',
            'description' => 'All content + practitioner management. Cannot delete roles or other admins.',
            'permissions' => ['cms.*', 'languages.*', 'members.*', 'reports.view', 'announcements.*', 'broadcast.*', 'qrcode.*', 'settings.view', 'music.*', 'testimonials.*', 'contact_channels.*', 'donations.*'],
        ],
        [
            'name' => 'content_manager',
            'display_name' => 'Content Manager',
            'description' => 'CMS only (pages, media, languages, broadcast). No user management.',
            'permissions' => ['cms.*', 'languages.*', 'broadcast.*', 'music.*', 'testimonials.*', 'contact_channels.*', 'donations.*'],
        ],
        [
            'name' => 'practitioner',
            'display_name' => 'Practitioner',
            'description' => 'Own dashboard only: assigned members, journey notes, announcements.',
            'permissions' => ['members.view', 'members.edit'],
        ],
    ];

    public function run(): void
    {
        $permissions = collect(self::GROUPS)->flatMap(
            fn ($actions, $group) => collect($actions)->map(fn ($action) => [
                'name' => "{$group}.{$action}",
                'group' => $group,
                'description' => ucfirst($action)." {$group}",
            ]),
        );

        $permissions->each(fn ($p) => Permission::updateOrCreate(['name' => $p['name']], $p));

        $allPermissionIds = Permission::pluck('id');

        foreach (self::ROLES as $roleData) {
            $role = Role::updateOrCreate(
                ['name' => $roleData['name']],
                ['display_name' => $roleData['display_name'], 'description' => $roleData['description'], 'is_system' => true],
            );

            if (in_array('*', $roleData['permissions'], true)) {
                $role->permissions()->sync($allPermissionIds);

                continue;
            }

            $ids = collect($roleData['permissions'])->flatMap(function ($entry) {
                if (str_ends_with($entry, '.*')) {
                    $group = substr($entry, 0, -2);

                    return Permission::where('group', $group)->pluck('id');
                }

                return Permission::where('name', $entry)->pluck('id');
            })->unique();

            $role->permissions()->sync($ids);
        }
    }
}
