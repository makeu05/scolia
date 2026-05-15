<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role'     => 'nullable|string',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'] ?? 'Administrateur',
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = \App\Models\User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Identifiants invalides'
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Connexion réussie',
        'user'    => $user,
        'token'   => $token
    ]);
}

    public function logout(Request $request)
    {
        return response()->json([
            'message' => 'Déconnecté'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}