<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use App\Models\Personne;
use App\Models\User;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Auth\User as Authenticatable;
class AuthController extends Controller
{
    public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // Chercher dans la table admin d'abord
    $admin = DB::table('admin')
        ->where('username', $request->username)
        ->first();

    if ($admin && Hash::check($request->password, $admin->password)) {

        // Mapper typeAdmin → rôle lisible
        $roles = [0 => 'root', 1 => 'admin', 2 => 'fondateur', 3 => 'directeur'];
        $role = $roles[$admin->typeAdmin] ?? 'admin';

        // Trouver ou créer le User Sanctum correspondant
        $user = \App\Models\User::firstOrCreate(
            ['email' => $admin->username . '@scolia.local'],
            [
                'name'     => $admin->nom,
                'email'    => $admin->username . '@scolia.local',
                'password' => $admin->password, // déjà hashé
                'role'     => $role,
            ]
        );

        // Révoquer les anciens tokens, créer un nouveau
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'name'     => $admin->nom,
                'username' => $admin->username,
                'role'     => $role,
                'type'     => 'admin',
                'typeCode' => $admin->typeAdmin,
            ],
        ]);
    }

    // Chercher dans personne (enseignants/parents)
    $personne = DB::table('personne')
        ->where('username', $request->username)
        ->first();

    if ($personne && Hash::check($request->password, $personne->password)) {

        $roles = [1 => 'enseignant', 4 => 'parent'];
        $role = $roles[$personne->typePersonne] ?? 'enseignant';

        $user = \App\Models\User::firstOrCreate(
            ['email' => $personne->username . '@scolia.local'],
            [
                'name'     => $personne->nom . ' ' . $personne->prenom,
                'email'    => $personne->username . '@scolia.local',
                'password' => $personne->password,
                'role'     => $role,
            ]
        );

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'       => $user->id,
                'name'     => $personne->nom . ' ' . $personne->prenom,
                'username' => $personne->username,
                'role'     => $role,
                'type'     => 'personne',
                'typeCode' => $personne->typePersonne,
            ],
        ]);
    }

    return response()->json(['message' => 'Identifiants invalides'], 401);
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}