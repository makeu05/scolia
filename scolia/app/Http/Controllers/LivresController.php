<?php

namespace App\Http\Controllers;

use App\Models\Livres;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LivresController extends Controller
{
    public function index(Request $request)
    {
        $query = Livres::with('specialite');

        if ($request->filled('idSpecialite')) {
            $query->where('idSpecialite', $request->idSpecialite);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('titre',   'like', "%$search%")
                  ->orWhere('auteurs', 'like', "%$search%")
                  ->orWhere('edition', 'like', "%$search%");
            });
        }

        if ($request->get('paginate') === 'false') {
            return response()->json($query->orderBy('titre')->get());
        }

        return response()->json($query->orderBy('titre')->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre'          => 'required|string|max:255',
            'auteurs'        => 'nullable|string|max:255',
            'prix'           => 'nullable|numeric|min:0',
            'idSpecialite'   => 'required|integer',
            'edition'        => 'nullable|string|max:255',
            'annee_parution' => 'nullable|date',
            'idAdmin'        => 'required|integer',
        ]);

        $livre = DB::transaction(function () use ($request) {
            $id = DB::table('Livres')->lockForUpdate()->max('idLivre') + 1;
            return Livres::create([
                'idLivre'        => $id,
                'titre'          => $request->titre,
                'auteurs'        => $request->auteurs ?? 'INDEFINI',
                'prix'           => $request->prix ?? 0,
                'idSpecialite'   => $request->idSpecialite,
                'edition'        => $request->edition ?? 'INDEFINI',
                'annee_parution' => $request->annee_parution,
                'idAdmin'        => $request->idAdmin,
            ]);
        });

        return response()->json([
            'message' => 'Livre ajouté à la bibliothèque',
            'livre'   => $livre->load('specialite'),
        ], 201);
    }

    public function show($id)
    {
        return response()->json(Livres::with('specialite')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $livre = Livres::findOrFail($id);

        $request->validate([
            'titre'          => 'sometimes|string|max:255',
            'auteurs'        => 'nullable|string|max:255',
            'prix'           => 'nullable|numeric|min:0',
            'edition'        => 'nullable|string|max:255',
            'annee_parution' => 'nullable|date',
            'idSpecialite'   => 'sometimes|integer',
        ]);

        $livre->update($request->only([
            'titre', 'auteurs', 'prix', 'edition', 'annee_parution', 'idSpecialite'
        ]));

        return response()->json([
            'message' => 'Livre mis à jour',
            'livre'   => $livre->fresh()->load('specialite'),
        ]);
    }

    public function destroy($id)
    {
        Livres::findOrFail($id)->delete();
        return response()->json(['message' => 'Livre supprimé']);
    }

    // Stats bibliothèque
    public function stats()
    {
        return response()->json([
            'total'       => Livres::count(),
            'parSpecialite' => DB::table('Livres')
                ->join('Specialite', 'Livres.idSpecialite', '=', 'Specialite.idSpecialite')
                ->select('Specialite.libelle', DB::raw('COUNT(*) as nb'))
                ->groupBy('Specialite.idSpecialite', 'Specialite.libelle')
                ->get(),
            'valeurTotale' => Livres::sum('prix'),
        ]);
    }
}