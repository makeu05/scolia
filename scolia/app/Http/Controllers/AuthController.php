<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ── LOGIN ─────────────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // 1. Chercher dans Admin
        $admin = DB::table('admin')
            ->where('username', $request->username)
            ->first();

        if ($admin) {
            // FIX: supporter mot de passe en clair (belva) ET hashé
            $passwordOk = Hash::check($request->password, $admin->password)
                       || $request->password === $admin->password;

            if ($passwordOk && $admin->actif) {
                $roles = [0 => 'root', 1 => 'admin', 2 => 'fondateur', 3 => 'directeur'];
                $role  = $roles[$admin->typeAdmin] ?? 'admin';

                $user = \App\Models\User::firstOrCreate(
                    ['email' => $admin->username . '@scolia.local'],
                    [
                        'name'     => $admin->nom,
                        'email'    => $admin->username . '@scolia.local',
                        'password' => Hash::make($request->password),
                        'role'     => $role,
                    ]
                );

                // Mettre à jour le rôle si changé
                if ($user->role !== $role) {
                    $user->update(['role' => $role]);
                }

                $user->tokens()->delete();
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'user'  => [
                        'id'        => $admin->ID,
                        'name'      => $admin->nom,
                        'username'  => $admin->username,
                        'role'      => $role,
                        'type'      => 'admin',
                        'typeCode'  => $admin->typeAdmin,
                        'mobile'    => $admin->mobile,
                        'alanyaID'  => $admin->alanyaID,
                        'actif'     => $admin->actif,
                    ],
                ]);
            }
        }

        // 2. Chercher dans Personne (enseignants / parents)
        $personne = DB::table('personne')
            ->where('username', $request->username)
            ->first();

        if ($personne && Hash::check($request->password, $personne->password)) {
            $roles = [1 => 'enseignant', 2 => 'admin', 4 => 'parent'];
            $role  = $roles[$personne->typePersonne] ?? 'enseignant';

            $user = \App\Models\User::firstOrCreate(
                ['email' => $personne->username . '@scolia.local'],
                [
                    'name'     => $personne->nom . ' ' . $personne->prenom,
                    'email'    => $personne->username . '@scolia.local',
                    'password' => $personne->password,
                    'role'     => $role,
                ]
            );

            if ($user->role !== $role) {
                $user->update(['role' => $role]);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user'  => [
                    'id'          => $personne->idPers,
                    'name'        => $personne->nom . ' ' . $personne->prenom,
                    'username'    => $personne->username,
                    'role'        => $role,
                    'type'        => 'personne',
                    'typeCode'    => $personne->typePersonne,
                    'mobile'      => $personne->mobile,
                    'alanyaID'    => $personne->alanyaID,
                ],
            ]);
        }

        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // ── ME — FIX: retourne les vraies infos de l'admin/personne ──────────────
    public function me(Request $request)
    {
        $user = $request->user(); // App\Models\User

        // Retrouver les données réelles selon le type
        $extra = null;

        if (in_array($user->role, ['root', 'admin', 'fondateur', 'directeur'])) {
            $username = str_replace('@scolia.local', '', $user->email);
            $extra = DB::table('admin')->where('username', $username)->first();
            if ($extra) {
                $roles = [0 => 'root', 1 => 'admin', 2 => 'fondateur', 3 => 'directeur'];
                return response()->json([
                    'id'        => $extra->ID,
                    'name'      => $extra->nom,
                    'username'  => $extra->username,
                    'role'      => $roles[$extra->typeAdmin] ?? $user->role,
                    'type'      => 'admin',
                    'typeCode'  => $extra->typeAdmin,
                    'mobile'    => $extra->mobile,
                    'alanyaID'  => $extra->alanyaID,
                    'actif'     => $extra->actif,
                ]);
            }
        }

        if (in_array($user->role, ['enseignant', 'parent'])) {
            $username = str_replace('@scolia.local', '', $user->email);
            $extra = DB::table('personne')->where('username', $username)->first();
            if ($extra) {
                $roles = [1 => 'enseignant', 4 => 'parent'];
                return response()->json([
                    'id'        => $extra->idPers,
                    'name'      => $extra->nom . ' ' . $extra->prenom,
                    'username'  => $extra->username,
                    'role'      => $roles[$extra->typePersonne] ?? $user->role,
                    'type'      => 'personne',
                    'typeCode'  => $extra->typePersonne,
                    'mobile'    => $extra->mobile,
                    'alanyaID'  => $extra->alanyaID,
                ]);
            }
        }

        // Fallback: retourner le user Sanctum
        return response()->json([
            'id'       => $user->id,
            'name'     => $user->name,
            'username' => str_replace('@scolia.local', '', $user->email),
            'role'     => $user->role,
            'type'     => 'user',
        ]);
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────────
    public function passwordReset(Request $request)
    {
        $request->validate([
            'username'     => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        // Chercher dans Admin
        $admin = DB::table('admin')->where('username', $request->username)->first();
        if ($admin) {
            DB::table('admin')
                ->where('username', $request->username)
                ->update(['password' => Hash::make($request->new_password)]);

            // Mettre à jour aussi le User Sanctum
            \App\Models\User::where('email', $request->username . '@scolia.local')
                ->update(['password' => Hash::make($request->new_password)]);

            return response()->json(['message' => 'Mot de passe réinitialisé']);
        }

        // Chercher dans Personne
        $personne = DB::table('personne')->where('username', $request->username)->first();
        if ($personne) {
            DB::table('personne')
                ->where('username', $request->username)
                ->update(['password' => Hash::make($request->new_password)]);

            \App\Models\User::where('email', $request->username . '@scolia.local')
                ->update(['password' => Hash::make($request->new_password)]);

            return response()->json(['message' => 'Mot de passe réinitialisé']);
        }

        return response()->json(['message' => 'Utilisateur introuvable'], 404);
    }
}