<?php

namespace App\Http\Controllers\API\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaiementRequest;
use App\Http\Resources\Finance\PaiementResource;
use App\Models\Paiement;
use App\Models\Scolarite;
use App\Services\PaiementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * PaiementController — API REST du module Finance
 *
 * DevSec :
 * - Toutes les routes sont protégées par auth:sanctum (défini dans api.php)
 * - Gate::authorize() vérifie les permissions de manière granulaire
 * - Pas de logique métier ici → tout délégué au PaiementService
 * - Les réponses passent toutes par PaiementResource (jamais de ->toArray() brut)
 * - Codes HTTP corrects : 201 créé, 200 ok, 403 interdit, 422 validation
 */
class PaiementController extends Controller
{
    public function __construct(private readonly PaiementService $service)
    {
    }

    // ─── GET /api/finance/paiements ───────────────────────────────────────────
    // Liste paginée avec filtres
    public function index(Request $request): JsonResponse
    {
        // Seuls admin, secrétaire et directeur voient tous les paiements
        Gate::authorize('viewAny', Paiement::class);

        $validated = $request->validate([
            'annee_id'    => ['nullable', 'integer', 'exists:annees_academiques,id'],
            'statut'      => ['nullable', 'in:en_regle,en_retard,exonere'],
            'eleve_id'    => ['nullable', 'integer', 'exists:eleves,id'],
            'date_debut'  => ['nullable', 'date', 'date_format:Y-m-d'],
            'date_fin'    => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:date_debut'],
            'per_page'    => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $paiements = Paiement::with(['scolarite.eleve', 'modePaiement', 'enregistrePar'])
            ->when($validated['eleve_id'] ?? null, fn ($q, $id) =>
                $q->whereHas('scolarite', fn ($s) => $s->where('eleve_id', $id))
            )
            ->when($validated['date_debut'] ?? null, fn ($q, $d) =>
                $q->where('date_paiement', '>=', $d)
            )
            ->when($validated['date_fin'] ?? null, fn ($q, $d) =>
                $q->where('date_paiement', '<=', $d)
            )
            ->latest('date_paiement')
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'data'  => PaiementResource::collection($paiements->items()),
            'meta'  => [
                'current_page' => $paiements->currentPage(),
                'last_page'    => $paiements->lastPage(),
                'total'        => $paiements->total(),
                'per_page'     => $paiements->perPage(),
            ],
        ]);
    }

    // ─── POST /api/finance/paiements ─────────────────────────────────────────
    // Enregistrer un paiement
    public function store(StorePaiementRequest $request): JsonResponse
    {
        // authorize() est déjà dans StorePaiementRequest
        try {
            $paiement = $this->service->enregistrer(
                $request->validated(),
                $request->user()
            );

            return response()->json([
                'message' => 'Paiement enregistré avec succès.',
                'data'    => new PaiementResource($paiement->load(['scolarite.eleve', 'modePaiement'])),
            ], 201);

        } catch (\InvalidArgumentException $e) {
            // Erreur métier (ex: surpaiement)
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // ─── GET /api/finance/paiements/{id} ─────────────────────────────────────
    public function show(Paiement $paiement): JsonResponse
    {
        Gate::authorize('view', $paiement);

        return response()->json([
            'data' => new PaiementResource($paiement->load(['scolarite.eleve', 'modePaiement', 'enregistrePar'])),
        ]);
    }

    // ─── DELETE /api/finance/paiements/{id} ──────────────────────────────────
    // Annuler un paiement (soft delete, pas une vraie suppression)
    public function destroy(Paiement $paiement, Request $request): JsonResponse
    {
        Gate::authorize('delete', $paiement);

        // Un paiement vieux de plus de 24h ne peut être annulé que par un admin
        if ($paiement->created_at->diffInHours(now()) > 24
            && $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Seul un administrateur peut annuler un paiement vieux de plus de 24h.',
            ], 403);
        }

        $this->service->annuler($paiement, $request->user());

        return response()->json(['message' => 'Paiement annulé avec succès.'], 200);
    }

    // ─── GET /api/finance/paiements/{id}/recu ────────────────────────────────
    // Télécharger le reçu PDF
    public function recu(Paiement $paiement): Response
    {
        Gate::authorize('view', $paiement);

        $pdf = $this->service->genererRecuPdf($paiement);

        return $pdf->download('recu-' . $paiement->numero_recu . '.pdf');
    }

    // ─── GET /api/finance/scolarites ─────────────────────────────────────────
    // Liste des scolarités avec statuts de paiement
    public function scolarites(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Paiement::class);

        $validated = $request->validate([
            'statut'   => ['nullable', 'in:en_regle,en_retard,exonere'],
            'annee_id' => ['nullable', 'integer', 'exists:annees_academiques,id'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $scolarites = Scolarite::with(['eleve', 'anneeAcademique'])
            ->when($validated['statut'] ?? null,   fn ($q, $s) => $q->where('statut', $s))
            ->when($validated['annee_id'] ?? null, fn ($q, $id) => $q->where('annee_academique_id', $id))
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'data' => $scolarites->items(),
            'meta' => [
                'current_page' => $scolarites->currentPage(),
                'last_page'    => $scolarites->lastPage(),
                'total'        => $scolarites->total(),
            ],
        ]);
    }

    // ─── GET /api/finance/stats ───────────────────────────────────────────────
    // Statistiques financières pour le dashboard
    public function stats(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Paiement::class);

        $anneeId = $request->validate(['annee_id' => 'nullable|integer'])['annee_id'] ?? null;

        return response()->json([
            'data' => $this->service->getStats($anneeId),
        ]);
    }

    // ─── GET /api/finance/alertes-retard ─────────────────────────────────────
    // Liste des élèves en retard de paiement
    public function alertesRetard(): JsonResponse
    {
        Gate::authorize('viewAny', Paiement::class);

        $retards = $this->service->getScolaritesEnRetard();

        return response()->json(['data' => $retards]);
    }
}