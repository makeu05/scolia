<?php

namespace App\Http\Controllers;

use App\Models\Messages;
use App\Models\Parents;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // ── GET /api/messages ─────────────────────────────────────
    public function index(Request $request)
    {
        $query = Messages::with(['expediteur', 'parent.personne']);

        if ($request->filled('type_message')) {
            $query->where('type_message', $request->type_message);
        }
        if ($request->filled('idExp_Pers')) {
            $query->where('idExp_Pers', $request->idExp_Pers);
        }

        if ($request->get('paginate') === 'false') {
            return response()->json($query->orderBy('created_at', 'desc')->get());
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    // ── POST /api/messages ────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'idMessages'   => 'required|integer|unique:messages,idMessages',
            'idExp_Pers'   => 'required|integer|exists:personne,idPers',
            'idParent'     => 'required|integer|exists:parents,idParent',
            'objet'        => 'required|string|max:255',
            'information'  => 'required|string',
            'type_message' => 'required|integer|in:0,1,2',
            'AnneeAcade'   => 'required|string|max:15',
        ]);

        $data['valider'] = 0;
        // Simulation Alanya — pas d'appel externe
        $message = Messages::create($data);

        return response()->json([
            'message' => 'Message envoyé avec succès.',
            'note'    => 'Simulation — API Alanya non connectée.',
            'data'    => $message->load(['expediteur', 'parent.personne']),
        ], 201);
    }

    // ── POST /api/messages/diffusion ──────────────────────────
    public function diffusion(Request $request)
    {
        $data = $request->validate([
            'idExp_Pers'   => 'required|integer|exists:personne,idPers',
            'objet'        => 'required|string|max:255',
            'information'  => 'required|string',
            'type_message' => 'required|integer|in:1,2',
            'AnneeAcade'   => 'required|string|max:15',
        ]);

        $parents = Parents::all();
        $count   = 0;

        foreach ($parents as $parent) {
            Messages::create([
                'idMessages'   => now()->timestamp + $parent->idParent,
                'idExp_Pers'   => $data['idExp_Pers'],
                'idParent'     => $parent->idParent,
                'objet'        => $data['objet'],
                'information'  => $data['information'],
                'type_message' => $data['type_message'],
                'AnneeAcade'   => $data['AnneeAcade'],
                'valider'      => 0,
            ]);
            $count++;
        }

        return response()->json([
            'message'       => "Message diffusé à {$count} parent(s) avec succès.",
            'note'          => 'Simulation — API Alanya non connectée.',
            'destinataires' => $count,
        ], 201);
    }

    // ── GET /api/messages/{id} ────────────────────────────────
    public function show($id)
    {
        return response()->json(
            Messages::with(['expediteur', 'parent.personne'])->findOrFail($id)
        );
    }

    // ── PATCH /api/messages/{id}/valider ──────────────────────
    public function valider($id)
    {
        $msg = Messages::findOrFail($id);
        $msg->update(['valider' => 1]);

        return response()->json(['message' => 'Message validé.', 'data' => $msg]);
    }
}
