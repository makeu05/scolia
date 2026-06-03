<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Models\Sanction;
use App\Models\Parents;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisciplineController extends Controller
{
    // ══════════════════════════════════════════════════════════════
    // INCIDENTS
    // ══════════════════════════════════════════════════════════════

    /** Liste des incidents — filtrable par élève, gravité, date */
    public function indexIncidents(Request $request)
    {
        $query = Incident::with(['eleve', 'rapporteur', 'sanctions'])
            ->orderByDesc('dateIncident');

        if ($request->filled('matricule'))
            $query->where('matricule', $request->matricule);

        if ($request->filled('gravite'))
            $query->where('gravite', $request->gravite);

        if ($request->filled('type'))
            $query->where('type', 'like', '%' . $request->type . '%');

        if ($request->filled('from'))
            $query->whereDate('dateIncident', '>=', $request->from);

        if ($request->filled('to'))
            $query->whereDate('dateIncident', '<=', $request->to);

        $perPage = (int) $request->get('per_page', 20);
        return response()->json($query->paginate($perPage));
    }

    /** Détail d'un incident avec ses sanctions */
    public function showIncident($id)
    {
        $incident = Incident::with(['eleve', 'rapporteur', 'sanctions'])
            ->findOrFail($id);
        return response()->json($incident);
    }

    /** Historique discipline d'un élève */
    public function historiqueEleve($matricule)
    {
        $incidents = Incident::with(['rapporteur', 'sanctions'])
            ->where('matricule', $matricule)
            ->orderByDesc('dateIncident')
            ->get();

        return response()->json([
            'matricule'  => $matricule,
            'total'      => $incidents->count(),
            'graves'     => $incidents->where('gravite', 'grave')->count(),
            'incidents'  => $incidents,
        ]);
    }

    /** Créer un incident */
    public function storeIncident(Request $request)
    {
        $data = $request->validate([
            'matricule'     => 'required|integer|exists:eleve,matricule',
            'idPers'        => 'required|integer|exists:personne,idPers',
            'type'          => 'required|string|max:60',
            'description'   => 'required|string',
            'dateIncident'  => 'required|date',
            'gravite'       => 'required|in:leger,moyen,grave',
            'idAdmin'       => 'required|integer',
        ]);

        $incident = Incident::create($data);
        $incident->load(['eleve', 'rapporteur']);

        return response()->json([
            'message'  => 'Incident enregistré',
            'incident' => $incident,
        ], 201);
    }

    /** Modifier un incident */
    public function updateIncident(Request $request, $id)
    {
        $incident = Incident::findOrFail($id);

        $request->validate([
            'type'        => 'sometimes|string|max:60',
            'description' => 'sometimes|string',
            'gravite'     => 'sometimes|in:leger,moyen,grave',
            'dateIncident'=> 'sometimes|date',
        ]);

        $incident->update($request->only([
            'type', 'description', 'gravite', 'dateIncident',
        ]));

        return response()->json([
            'message'  => 'Incident mis à jour',
            'incident' => $incident->fresh()->load(['eleve', 'rapporteur', 'sanctions']),
        ]);
    }

    /** Supprimer un incident (et ses sanctions en cascade) */
    public function destroyIncident($id)
    {
        Incident::findOrFail($id)->delete();
        return response()->json(['message' => 'Incident supprimé']);
    }

    // ══════════════════════════════════════════════════════════════
    // SANCTIONS
    // ══════════════════════════════════════════════════════════════

    /** Ajouter une sanction à un incident */
    public function storeSanction(Request $request, $idIncident)
    {
        $incident = Incident::findOrFail($idIncident);

        $data = $request->validate([
            'type'           => 'required|in:avertissement,blame,convocation_parent,exclusion_temporaire,exclusion_definitive,autre',
            'motif'          => 'required|string',
            'dateSanction'   => 'required|date',
            'dateExpiration' => 'nullable|date|after:dateSanction',
            'idAdmin'        => 'required|integer',
        ]);

        $data['matricule']  = $incident->matricule;
        $data['idIncident'] = $incident->idIncident;

        $sanction = Sanction::create($data);

        // Notifier les parents si convocation ou exclusion
        if (in_array($data['type'], ['convocation_parent', 'exclusion_temporaire', 'exclusion_definitive'])) {
            $this->notifierParents($incident, $sanction);
            $sanction->update([
                'parentNotifie'   => true,
                'parentNotifieAt' => now(),
            ]);
        }

        return response()->json([
            'message'  => 'Sanction enregistrée',
            'sanction' => $sanction->fresh(),
        ], 201);
    }

    /** Modifier une sanction */
    public function updateSanction(Request $request, $idSanction)
    {
        $sanction = Sanction::findOrFail($idSanction);

        $request->validate([
            'type'           => 'sometimes|in:avertissement,blame,convocation_parent,exclusion_temporaire,exclusion_definitive,autre',
            'motif'          => 'sometimes|string',
            'dateSanction'   => 'sometimes|date',
            'dateExpiration' => 'nullable|date',
        ]);

        $sanction->update($request->only([
            'type', 'motif', 'dateSanction', 'dateExpiration',
        ]));

        return response()->json([
            'message'  => 'Sanction mise à jour',
            'sanction' => $sanction->fresh(),
        ]);
    }

    /** Supprimer une sanction */
    public function destroySanction($idSanction)
    {
        Sanction::findOrFail($idSanction)->delete();
        return response()->json(['message' => 'Sanction supprimée']);
    }

    /** Notifier manuellement les parents d'une sanction */
    public function notifierParentsManuellement($idSanction)
    {
        $sanction = Sanction::with('incident')->findOrFail($idSanction);
        $this->notifierParents($sanction->incident, $sanction);

        $sanction->update([
            'parentNotifie'   => true,
            'parentNotifieAt' => now(),
        ]);

        return response()->json(['message' => 'Parents notifiés']);
    }

    /** Stats discipline */
    public function stats(Request $request)
    {
        $from = $request->get('from', now()->startOfYear()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        return response()->json([
            'total_incidents'  => Incident::whereBetween('dateIncident', [$from, $to])->count(),
            'graves'           => Incident::where('gravite', 'grave')->whereBetween('dateIncident', [$from, $to])->count(),
            'total_sanctions'  => Sanction::whereBetween('dateSanction', [$from, $to])->count(),
            'par_type'         => Sanction::whereBetween('dateSanction', [$from, $to])
                                    ->select('type', DB::raw('count(*) as total'))
                                    ->groupBy('type')
                                    ->get(),
            'par_gravite'      => Incident::whereBetween('dateIncident', [$from, $to])
                                    ->select('gravite', DB::raw('count(*) as total'))
                                    ->groupBy('gravite')
                                    ->get(),
            'eleves_recidivistes' => Incident::whereBetween('dateIncident', [$from, $to])
                                    ->select('matricule', DB::raw('count(*) as nb'))
                                    ->groupBy('matricule')
                                    ->having('nb', '>=', 3)
                                    ->with('eleve')
                                    ->orderByDesc('nb')
                                    ->limit(10)
                                    ->get(),
        ]);
    }

    // ── Privé : créer une notification pour les parents ───────────────────────
    private function notifierParents(Incident $incident, Sanction $sanction): void
    {
        $typeLabel = [
            'convocation_parent'    => 'Convocation',
            'exclusion_temporaire'  => 'Exclusion temporaire',
            'exclusion_definitive'  => 'Exclusion définitive',
        ][$sanction->type] ?? 'Sanction';

        // Récupérer les parents de l'élève via la table parents
        $parents = DB::table('parents')
            ->where('matricule', $incident->matricule)
            ->get();

        foreach ($parents as $parent) {
            // Créer une notification dans la table notifications
            Notification::create([
                'idPers'  => $parent->idPers,
                'titre'   => "$typeLabel — {$incident->eleve?->nom} {$incident->eleve?->prenom}",
                'message' => "Motif : {$sanction->motif}. Incident du {$incident->dateIncident->format('d/m/Y')}.",
                'type'    => 'discipline',
                'lu'      => false,
            ]);
        }
    }
}