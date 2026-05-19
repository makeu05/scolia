<?php

namespace App\Services;

use App\Models\Paiement;
use App\Models\Scolarite;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * PaiementService — Logique métier du module Finance
 *
 * DevSec :
 * - Toutes les opérations d'écriture sont dans des transactions DB
 * - Aucun montant float en base : on travaille en centimes (×100)
 * - Les logs d'audit enregistrent QUI a fait QUOI et QUAND
 * - Vérification que le paiement ne dépasse pas le solde restant
 */
class PaiementService
{
    // ─── Enregistrement d'un paiement ────────────────────────────────────────
    public function enregistrer(array $data, User $operateur): Paiement
    {
        return DB::transaction(function () use ($data, $operateur) {

            $scolarite = Scolarite::lockForUpdate()->findOrFail($data['scolarite_id']);

            // ── Vérification métier : ne pas surpayer ──────────────────────
            $soldeRestant = $scolarite->montant_total - $scolarite->montant_paye;
            $montantCentimes = (int) round($data['montant'] * 100); // FCFA → centimes

            if ($montantCentimes > $soldeRestant) {
                throw new \InvalidArgumentException(
                    'Le montant (' . ($montantCentimes / 100) . ' FCFA) dépasse le solde restant (' . ($soldeRestant / 100) . ' FCFA).'
                );
            }

            // ── Création du paiement ────────────────────────────────────────
            $paiement = Paiement::create([
                'scolarite_id'     => $scolarite->id,
                'mode_paiement_id' => $data['mode_paiement_id'],
                'enregistre_par'   => $operateur->id,
                'montant'          => $montantCentimes,
                'date_paiement'    => $data['date_paiement'],
                'reference'        => $data['reference'] ?? null,
                'numero_recu'      => $this->genererNumeroRecu(),
                'notes'            => $data['notes'] ?? null,
            ]);

            // ── Mise à jour du solde de la scolarité ────────────────────────
            $scolarite->recalculer();

            // ── Log d'audit (DevSec) ────────────────────────────────────────
            Log::channel('audit')->info('Paiement enregistré', [
                'paiement_id'  => $paiement->id,
                'scolarite_id' => $scolarite->id,
                'montant_fcfa' => $montantCentimes / 100,
                'operateur_id' => $operateur->id,
                'ip'           => request()->ip(),
                'timestamp'    => Carbon::now()->toIso8601String(),
            ]);

            return $paiement;
        });
    }

    // ─── Annulation d'un paiement (soft delete + recalcul) ───────────────────
    public function annuler(Paiement $paiement, User $operateur): void
    {
        DB::transaction(function () use ($paiement, $operateur) {

            $scolarite = $paiement->scolarite;

            // SoftDelete : le paiement reste en base mais est marqué supprimé
            $paiement->delete();

            // Recalcul du solde
            $scolarite->recalculer();

            Log::channel('audit')->warning('Paiement annulé', [
                'paiement_id'  => $paiement->id,
                'scolarite_id' => $scolarite->id,
                'montant_fcfa' => $paiement->montant / 100,
                'operateur_id' => $operateur->id,
                'ip'           => request()->ip(),
                'timestamp'    => Carbon::now()->toIso8601String(),
            ]);
        });
    }

    // ─── Génération du reçu PDF ───────────────────────────────────────────────
    public function genererRecuPdf(Paiement $paiement): \Barryvdh\DomPDF\PDF
    {
        $paiement->load(['scolarite.eleve', 'modePaiement', 'enregistrePar']);

        $data = [
            'paiement'      => $paiement,
            'eleve'         => $paiement->scolarite->eleve,
            'montant_fcfa'  => number_format($paiement->montant / 100, 0, ',', ' ') . ' FCFA',
            'solde_restant' => number_format(($paiement->scolarite->montant_total - $paiement->scolarite->montant_paye) / 100, 0, ',', ' ') . ' FCFA',
            'date_emission' => Carbon::now()->locale('fr')->isoFormat('LL'),
            'ecole'         => config('sgs.nom_ecole', 'École SGS'),
        ];

        return Pdf::loadView('pdf.recu_paiement', $data)
                  ->setPaper('A5', 'portrait');
    }

    // ─── Détection des retards et alertes ────────────────────────────────────
    public function getScolaritesEnRetard(): \Illuminate\Database\Eloquent\Collection
    {
        return Scolarite::with(['eleve.personne'])
            ->where('statut', 'en_retard')
            ->where('date_limite', '<', Carbon::today())
            ->orderBy('date_limite')
            ->get();
    }

    // ─── Générateur de numéro de reçu unique ─────────────────────────────────
    private function genererNumeroRecu(): string
    {
        do {
            $numero = 'REC-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (Paiement::withTrashed()->where('numero_recu', $numero)->exists());

        return $numero;
    }

    // ─── Statistiques pour le dashboard ──────────────────────────────────────
    public function getStats(?int $anneeAcademiqueId = null): array
    {
        $query = Scolarite::query();
        if ($anneeAcademiqueId) {
            $query->where('annee_academique_id', $anneeAcademiqueId);
        }

        $total  = $query->sum('montant_total');
        $percu  = $query->sum('montant_paye');
        $retard = (clone $query)->where('statut', 'en_retard')->count();

        return [
            'montant_total_fcfa'    => $total / 100,
            'montant_percu_fcfa'    => $percu / 100,
            'montant_restant_fcfa'  => ($total - $percu) / 100,
            'taux_recouvrement'     => $total > 0 ? round(($percu / $total) * 100, 1) : 0,
            'nb_eleves_en_retard'   => $retard,
        ];
    }
}