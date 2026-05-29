<?php

namespace App\Http\Controllers;

use App\Models\Messages;
use App\Models\Parents;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessagesController extends Controller
{
    // Types de messages
    const TYPE_INDIVIDUEL = 0;
    const TYPE_TOUS_PARENTS = 1;
    const TYPE_PARENTS_PAIEMENT = 2;

    public function index(Request $request)
    {
        $query = Messages::with(['expediteur', 'parent.personne']);

        if ($request->filled('idParent')) {
            $query->where('idParent', $request->idParent);
        }
        if ($request->filled('type_message')) {
            $query->where('type_message', $request->type_message);
        }
        if ($request->filled('valider')) {
            $query->where('valider', $request->valider);
        }
        if ($request->filled('idAnnee')) {
            $query->where('AnneeAcade', $request->idAnnee);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('objet',       'like', "%$search%")
                  ->orWhere('information', 'like', "%$search%");
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'idExp_Pers'   => 'required|integer',
            'idParent'     => 'required|integer',
            'objet'        => 'required|string|max:255',
            'information'  => 'required|string',
            'type_message' => 'required|integer|in:0,1,2',
            'AnneeAcade'   => 'required|string|max:15',
        ]);

        $message = DB::transaction(function () use ($request) {
            $id = DB::table('Messages')->lockForUpdate()->max('idMessages') + 1;
            return Messages::create([
                'idMessages'   => $id,
                'idExp_Pers'   => $request->idExp_Pers,
                'idParent'     => $request->idParent,
                'objet'        => $request->objet,
                'information'  => $request->information,
                'type_message' => $request->type_message,
                'AnneeAcade'   => $request->AnneeAcade,
                'valider'      => 0,
            ]);
        });

        return response()->json([
            'message' => 'Message envoyé avec succès',
            'data'    => $message->load(['expediteur', 'parent.personne']),
        ], 201);
    }

    // Envoyer à tous les parents d'une école
    public function envoyerATous(Request $request)
    {
        $request->validate([
            'idExp_Pers'   => 'required|integer',
            'objet'        => 'required|string|max:255',
            'information'  => 'required|string',
            'type_message' => 'required|integer|in:1,2',
            'AnneeAcade'   => 'required|string|max:15',
            'idAdmin'      => 'required|integer',
        ]);

        // Récupérer tous les parents distincts
        $parents = DB::table('Parents')
            ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->where('Eleve.actif', 1)
            ->distinct()
            ->pluck('Parents.idParent');

        if ($parents->isEmpty()) {
            return response()->json(['message' => 'Aucun parent trouvé'], 422);
        }

        $nbEnvoyes = 0;
        DB::transaction(function () use ($request, $parents, &$nbEnvoyes) {
            foreach ($parents as $idParent) {
                $id = DB::table('Messages')->max('idMessages') + 1;
                Messages::create([
                    'idMessages'   => $id,
                    'idExp_Pers'   => $request->idExp_Pers,
                    'idParent'     => $idParent,
                    'objet'        => $request->objet,
                    'information'  => $request->information,
                    'type_message' => $request->type_message,
                    'AnneeAcade'   => $request->AnneeAcade,
                    'valider'      => 0,
                ]);
                $nbEnvoyes++;
            }
        });

        return response()->json([
            'message'    => "$nbEnvoyes message(s) envoyé(s) avec succès",
            'nb_envoyes' => $nbEnvoyes,
        ], 201);
    }

    public function show($id)
    {
        return response()->json(
            Messages::with(['expediteur', 'parent.personne'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $msg = Messages::findOrFail($id);
        $request->validate([
            'objet'       => 'sometimes|string|max:255',
            'information' => 'sometimes|string',
            'valider'     => 'sometimes|boolean',
        ]);
        $msg->update($request->only(['objet', 'information', 'valider']));
        return response()->json(['message' => 'Message mis à jour', 'data' => $msg]);
    }

    public function destroy($id)
    {
        Messages::findOrFail($id)->delete();
        return response()->json(['message' => 'Message supprimé']);
    }

    // Valider un message
    public function valider($id)
    {
        $msg = Messages::findOrFail($id);
        $msg->update(['valider' => 1]);
        return response()->json(['message' => 'Message validé']);
    }

    // Messages reçus par un parent
    public function messagesParent($idParent)
    {
        $messages = Messages::with('expediteur')
            ->where('idParent', $idParent)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    // Stats communication
    public function stats()
    {
        return response()->json([
            'total'      => Messages::count(),
            'valides'    => Messages::where('valider', 1)->count(),
            'en_attente' => Messages::where('valider', 0)->count(),
            'individuels'=> Messages::where('type_message', 0)->count(),
            'collectifs' => Messages::where('type_message', '>', 0)->count(),
        ]);
    }
}