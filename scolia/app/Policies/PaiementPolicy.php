<?php

namespace App\Policies;

use App\Models\Paiement;
use App\Models\User;

class PaiementPolicy
{
    private const ROLES_FINANCE = ['admin', 'directeur', 'secretaire'];

    public function viewAny(User $user): bool
    {
        return in_array($user->role, self::ROLES_FINANCE);
    }

    public function view(User $user, Paiement $paiement): bool
    {
        return in_array($user->role, self::ROLES_FINANCE);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'secretaire']);
    }

    public function delete(User $user, Paiement $paiement): bool
    {
        return in_array($user->role, ['admin', 'directeur']);
    }
}