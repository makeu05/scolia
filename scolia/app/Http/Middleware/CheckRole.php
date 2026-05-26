<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // $user est un App\Models\User — il a directement un champ "role"
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé — rôle insuffisant',
                'votre_role' => $user->role,        // utile pour déboguer
                'roles_requis' => $roles,
            ], 403);
        }

        return $next($request);
    }
}