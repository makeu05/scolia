<?php
namespace App\Http\Controllers;

use App\Models\Messages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessagesController extends Controller
{
    // ── Liste des conversations (pour admin) ──────────────────────────────────
    // Retourne la liste des parents avec qui il y a des messages
    public function conversations(Request $request)
    {
        // Derniers messages par parent
        $convs = DB::table('messages')
            ->join('parents', 'messages.idParent', '=', 'parents.idParent')
            ->join('personne as p', 'parents.idPers', '=', 'p.idPers')
            ->select(
                'messages.idParent',
                'p.nom', 'p.prenom', 'p.mobile',
                DB::raw('MAX(messages.created_at) as dernierMessage'),
                DB::raw('COUNT(CASE WHEN messages.lu = 0 AND messages.direction = "parent_to_admin" THEN 1 END) as nonLus'),
                DB::raw('(SELECT information FROM messages m2 WHERE m2.idParent = messages.idParent ORDER BY m2.created_at DESC LIMIT 1) as dernier_contenu')
            )
            ->groupBy('messages.idParent', 'p.nom', 'p.prenom', 'p.mobile')
            ->orderByDesc('dernierMessage')
            ->get();

        return response()->json($convs);
    }

    // ── Messages d'une conversation ───────────────────────────────────────────
    public function conversation(Request $request, $idParent)
    {
        $depuis = $request->query('depuis'); // pour le polling

        $query = DB::table('messages')
            ->where('idParent', $idParent)
            ->whereIn('type_message', [0]) // messages individuels seulement
            ->orderBy('created_at', 'asc');

        if ($depuis) {
            $query->where('created_at', '>', $depuis);
        }

        $messages = $query->select(
            'idMessages', 'idExp_Pers', 'idParent', 'information',
            'objet', 'direction', 'lu', 'created_at'
        )->get();

        // Marquer comme lus les messages du parent vers admin
        DB::table('messages')
            ->where('idParent', $idParent)
            ->where('direction', 'parent_to_admin')
            ->where('lu', 0)
            ->update(['lu' => 1, 'lu_at' => now()]);

        return response()->json($messages);
    }

    // ── Envoyer un message (admin → parent) ───────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'idParent'    => 'required|integer',
            'information' => 'required|string|max:2000',
            'idExp_Pers'  => 'required|integer',
            'AnneeAcade'  => 'nullable|string',
        ]);

        $id = DB::table('messages')->max('idMessages') + 1;

        $msg = Messages::create([
            'idMessages'   => $id,
            'idExp_Pers'   => $request->idExp_Pers,
            'idParent'     => $request->idParent,
            'objet'        => $request->objet ?? 'Message',
            'information'  => $request->information,
            'type_message' => 0,
            'direction'    => 'admin_to_parent',
            'AnneeAcade'   => $request->AnneeAcade ?? date('Y'),
            'valider'      => 1,
            'lu'           => 0,
        ]);

        return response()->json(['message' => 'Envoyé', 'data' => $msg], 201);
    }

    // ── Envoyer un message (parent → admin) ───────────────────────────────────
    public function storeParent(Request $request)
    {
        $request->validate([
            'idParent'    => 'required|integer',
            'information' => 'required|string|max:2000',
            'idExp_Pers'  => 'required|integer',
        ]);

        $id = DB::table('messages')->max('idMessages') + 1;

        $msg = Messages::create([
            'idMessages'   => $id,
            'idExp_Pers'   => $request->idExp_Pers,
            'idParent'     => $request->idParent,
            'objet'        => 'Message parent',
            'information'  => $request->information,
            'type_message' => 0,
            'direction'    => 'parent_to_admin',
            'AnneeAcade'   => date('Y'),
            'valider'      => 0,
            'lu'           => 0,
        ]);

        return response()->json(['message' => 'Envoyé', 'data' => $msg], 201);
    }

    // ── Polling : nouveaux messages depuis une date ────────────────────────────
    public function polling(Request $request)
    {
        $idParent = $request->query('idParent');
        $depuis   = $request->query('depuis');
        $direction= $request->query('direction', 'parent_to_admin'); // admin poll les msgs parents

        $query = DB::table('messages')
            ->where('direction', $direction)
            ->where('lu', 0);

        if ($idParent) $query->where('idParent', $idParent);
        if ($depuis)   $query->where('created_at', '>', $depuis);

        $nouveaux = $query->count();

        return response()->json([
            'nouveaux'  => $nouveaux,
            'timestamp' => now()->toISOString(),
        ]);
    }

    // ── Envoyer à tous les parents ─────────────────────────────────────────────
    public function envoyerATous(Request $request)
    {
        $request->validate([
            'idExp_Pers'   => 'required|integer',
            'objet'        => 'required|string|max:255',
            'information'  => 'required|string',
            'type_message' => 'required|integer|in:1,2',
            'AnneeAcade'   => 'required|string|max:15',
        ]);

        $parents = DB::table('parents')
            ->join('Eleve', 'parents.matricule', '=', 'Eleve.matricule')
            ->where('Eleve.actif', 1)
            ->distinct()
            ->pluck('parents.idParent');

        if ($parents->isEmpty()) {
            return response()->json(['message' => 'Aucun parent trouvé'], 422);
        }

        $nb = 0;
        DB::transaction(function () use ($request, $parents, &$nb) {
            foreach ($parents as $idParent) {
                $id = DB::table('messages')->max('idMessages') + 1;
                Messages::create([
                    'idMessages'   => $id,
                    'idExp_Pers'   => $request->idExp_Pers,
                    'idParent'     => $idParent,
                    'objet'        => $request->objet,
                    'information'  => $request->information,
                    'type_message' => $request->type_message,
                    'direction'    => 'admin_to_parent',
                    'AnneeAcade'   => $request->AnneeAcade,
                    'valider'      => 1,
                    'lu'           => 0,
                ]);
                $nb++;
            }
        });

        return response()->json(['message' => "$nb message(s) envoyé(s)", 'nb' => $nb], 201);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'total'       => Messages::count(),
            'valides'     => Messages::where('valider', 1)->count(),
            'en_attente'  => Messages::where('valider', 0)->count(),
            'non_lus'     => Messages::where('lu', 0)->where('direction', 'parent_to_admin')->count(),
            'collectifs'  => Messages::where('type_message', '>', 0)->count(),
        ]);
    }

    // ── Valider un message ────────────────────────────────────────────────────
    public function valider($id)
    {
        Messages::findOrFail($id)->update(['valider' => 1]);
        return response()->json(['message' => 'Message validé']);
    }

    // ── Index général ─────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Messages::orderByDesc('created_at');

        if ($request->filled('idParent'))     $query->where('idParent', $request->idParent);
        if ($request->filled('type_message')) $query->where('type_message', $request->type_message);
        if ($request->filled('valider'))      $query->where('valider', $request->valider);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('objet', 'like', "%$s%")->orWhere('information', 'like', "%$s%"));
        }

        return response()->json($query->paginate(20));
    }

    public function destroy($id)
    {
        Messages::findOrFail($id)->delete();
        return response()->json(['message' => 'Message supprimé']);
    }

    public function messagesParent($idParent)
    {
        return response()->json(
            Messages::where('idParent', $idParent)->orderByDesc('created_at')->get()
        );
    }
}