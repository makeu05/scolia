<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    // ─────────────────────────────────────────────
    // LIST — tous les utilisateurs (admin + personne)
    // ─────────────────────────────────────────────
    public function index(Request $request)
{
    $search = $request->query('search', '');
    $type   = $request->query('type', 'all');

    $users = [];

    // Admins
    if (in_array($type, ['all', 'admin'])) {
        $query = DB::table('admin')
            ->select('ID as sourceId', 'nom', 'username', 'typeAdmin', 'actif', 'mobile', 'created_at')
            ->when($search, function($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%");
            });

        $admins = $query->get()->map(function ($a) {
            $roles = [0 => 'root', 1 => 'admin', 2 => 'fondateur', 3 => 'directeur'];
            return [
                'id'       => 'a_' . $a->sourceId,
                'sourceId' => $a->sourceId,
                'source'   => 'admin',
                'nom'      => $a->nom,
                'username' => $a->username,
                'role'     => $roles[$a->typeAdmin] ?? 'admin',
                'actif'    => $a->actif,
                'mobile'   => $a->mobile,
                'created'  => $a->created_at,
            ];
        })->toArray();

        $users = array_merge($users, $admins);
    }

    // Personnes (Enseignants + Parents)
    if (in_array($type, ['all', 'personne'])) {
        $query = DB::table('personne')
            ->select('idPers as sourceId', 'nom', 'prenom', 'username', 'typePersonne', 'mobile', 'created_at')
            ->when($search, function($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%");
            });

        $personnes = $query->get()->map(function ($p) {
            $roles = [1 => 'enseignant', 4 => 'parent'];
            return [
                'id'       => 'p_' . $p->sourceId,
                'sourceId' => $p->sourceId,
                'source'   => 'personne',
                'nom'      => trim($p->nom . ' ' . ($p->prenom ?? '')),
                'username' => $p->username,
                'role'     => $roles[$p->typePersonne] ?? 'personne',
                'actif'    => 1,
                'mobile'   => $p->mobile,
                'created'  => $p->created_at,
            ];
        })->toArray();

        $users = array_merge($users, $personnes);
    }

    // Tri par nom
    usort($users, fn($a, $b) => strcmp($a['nom'], $b['nom']));

    return response()->json([
        'data' => $users,
        'total' => count($users),
    ]);
}
    // ─────────────────────────────────────────────
    // STORE — créer un utilisateur
    // ─────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'nom'      => 'required|string|max:100',
            'username' => 'required|string|max:100',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:root,admin,fondateur,directeur,enseignant,parent',
            'mobile'   => 'nullable|string|max:15',
            // Champs spécifiques enseignant/parent
            'prenom'        => 'required_if:role,enseignant,parent|string|max:100',
            'dateNaissance' => 'required_if:role,enseignant,parent|date',
        ]);

        $username = $request->username;
        $password = Hash::make($request->password);

        // Vérifier unicité username
        $existsAdmin    = DB::table('admin')->where('username', $username)->exists();
        $existsPersonne = DB::table('personne')->where('username', $username)->exists();

        if ($existsAdmin || $existsPersonne) {
            return response()->json(['message' => "Le nom d'utilisateur '$username' est déjà pris"], 422);
        }

        $adminRoles = ['root' => 0, 'admin' => 1, 'fondateur' => 2, 'directeur' => 3];

        if (isset($adminRoles[$request->role])) {
            // Créer dans table admin
            $id = DB::table('admin')->insertGetId([
                'nom'       => $request->nom,
                'username'  => $username,
                'password'  => $password,
                'typeAdmin' => $adminRoles[$request->role],
                'mobile'    => $request->mobile ?? '000',
                'alanyaID'  => 'SCO' . rand(1000, 9999),
                'actif'     => 1,
                'created_at' => now(),
            ]);

            // Créer le User Sanctum correspondant
            User::firstOrCreate(
                ['email' => $username . '@scolia.local'],
                [
                    'name'     => $request->nom,
                    'password' => $password,
                    'role'     => $request->role,
                ]
            );

            return response()->json([
                'message' => 'Utilisateur admin créé avec succès',
                'id'      => 'a_' . $id,
            ], 201);
        }

        // Créer dans table personne (enseignant ou parent)
        $typePersonne = $request->role === 'enseignant' ? 1 : 4;

        $id = DB::table('personne')->insertGetId([
            'nom'           => $request->nom,
            'prenom'        => $request->prenom,
            'dateNaissance' => $request->dateNaissance,
            'lieuNaissance' => $request->lieuNaissance ?? 'INDEFINI',
            'mobile'        => $request->mobile ?? '000',
            'phone'         => $request->phone ?? '000',
            'typePersonne'  => $typePersonne,
            'username'      => $username,
            'password'      => $password,
            'alanyaID'      => 'SCO' . rand(1000, 9999),
            'idAdmin'       => $request->user()->id,
            'created_at'    => now(),
        ]);

        User::firstOrCreate(
            ['email' => $username . '@scolia.local'],
            [
                'name'     => $request->nom . ' ' . $request->prenom,
                'password' => $password,
                'role'     => $request->role,
            ]
        );

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'id'      => 'p_' . $id,
        ], 201);
    }

    // ─────────────────────────────────────────────
    // UPDATE — modifier un utilisateur
    // ─────────────────────────────────────────────
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nom'    => 'sometimes|string|max:100',
            'mobile' => 'sometimes|string|max:15',
            'role'   => 'sometimes|in:root,admin,fondateur,directeur,enseignant,parent',
        ]);

        [$source, $sourceId] = explode('_', $id, 2);

        if ($source === 'a') {
            $adminRoles = ['root' => 0, 'admin' => 1, 'fondateur' => 2, 'directeur' => 3];
            $data = [];
            if ($request->has('nom'))    $data['nom']    = $request->nom;
            if ($request->has('mobile')) $data['mobile'] = $request->mobile;
            if ($request->has('role') && isset($adminRoles[$request->role])) {
                $data['typeAdmin'] = $adminRoles[$request->role];
            }
            DB::table('admin')->where('ID', $sourceId)->update($data);

            // Sync User Sanctum
            if ($request->has('role')) {
                $admin = DB::table('admin')->where('ID', $sourceId)->first();
                User::where('email', $admin->username . '@scolia.local')
                    ->update(['role' => $request->role]);
            }
        } else {
            $data = [];
            if ($request->has('nom'))    $data['nom']    = $request->nom;
            if ($request->has('mobile')) $data['mobile'] = $request->mobile;
            DB::table('personne')->where('idPers', $sourceId)->update($data);
        }

        return response()->json(['message' => 'Utilisateur mis à jour']);
    }

    // ─────────────────────────────────────────────
    // TOGGLE ACTIF — activer / désactiver
    // ─────────────────────────────────────────────
    public function toggleActif(string $id)
    {
        [$source, $sourceId] = explode('_', $id, 2);

        if ($source !== 'a') {
            return response()->json(['message' => 'Désactivation disponible pour les admins uniquement'], 422);
        }

        $admin = DB::table('admin')->where('ID', $sourceId)->first();
        if (!$admin) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $newActif = $admin->actif ? 0 : 1;
        DB::table('admin')->where('ID', $sourceId)->update(['actif' => $newActif]);

        // Révoquer les tokens si désactivé
        if (!$newActif) {
            $user = User::where('email', $admin->username . '@scolia.local')->first();
            $user?->tokens()->delete();
        }

        return response()->json([
            'message' => $newActif ? 'Utilisateur activé' : 'Utilisateur désactivé',
            'actif'   => $newActif,
        ]);
    }

    // ─────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────
    public function resetPassword(Request $request, string $id)
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        [$source, $sourceId] = explode('_', $id, 2);
        $hashed = Hash::make($request->password);

        if ($source === 'a') {
            DB::table('admin')->where('ID', $sourceId)->update(['password' => $hashed]);
            $admin = DB::table('admin')->where('ID', $sourceId)->first();
            User::where('email', $admin->username . '@scolia.local')
                ->update(['password' => $hashed]);
            // Révoquer tous les tokens → force reconnexion
            $user = User::where('email', $admin->username . '@scolia.local')->first();
            $user?->tokens()->delete();
        } else {
            DB::table('personne')->where('idPers', $sourceId)->update(['password' => $hashed]);
            $personne = DB::table('personne')->where('idPers', $sourceId)->first();
            User::where('email', $personne->username . '@scolia.local')
                ->update(['password' => $hashed]);
            $user = User::where('email', $personne->username . '@scolia.local')->first();
            $user?->tokens()->delete();
        }

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }

    // ─────────────────────────────────────────────
    // SHOW — détail d'un utilisateur
    // ─────────────────────────────────────────────
    public function show(string $id)
    {
        [$source, $sourceId] = explode('_', $id, 2);

        if ($source === 'a') {
            $admin = DB::table('admin')->where('ID', $sourceId)->first();
            if (!$admin) return response()->json(['message' => 'Introuvable'], 404);
            $roles = [0 => 'root', 1 => 'admin', 2 => 'fondateur', 3 => 'directeur'];
            return response()->json([
                'id'       => 'a_' . $admin->ID,
                'sourceId' => $admin->ID,
                'source'   => 'admin',
                'nom'      => $admin->nom,
                'username' => $admin->username,
                'role'     => $roles[$admin->typeAdmin] ?? 'admin',
                'actif'    => $admin->actif,
                'mobile'   => $admin->mobile,
                'created'  => $admin->created_at,
            ]);
        }

        $personne = DB::table('personne')->where('idPers', $sourceId)->first();
        if (!$personne) return response()->json(['message' => 'Introuvable'], 404);
        $roles = [1 => 'enseignant', 4 => 'parent'];
        return response()->json([
            'id'       => 'p_' . $personne->idPers,
            'sourceId' => $personne->idPers,
            'source'   => 'personne',
            'nom'      => $personne->nom . ' ' . $personne->prenom,
            'username' => $personne->username,
            'role'     => $roles[$personne->typePersonne] ?? 'enseignant',
            'actif'    => 1,
            'mobile'   => $personne->mobile,
            'created'  => $personne->created_at,
        ]);
    }
}