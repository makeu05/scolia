<?php
namespace App\Http\Controllers;

use App\Models\EleveTranche;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaiementTrancheController extends Controller
{
    // ── Récupérer les tranches d'un élève (auto-calcul depuis son cycle) ──────
    public function parEleve(Request $request, $matricule)
    {
        $idAca = $request->query('idAca');

        // 1. Trouver la classe et le cycle de l'élève via Frequente → Salle → Classe → Cycle
        $inscription = DB::table('frequente')
            ->join('salle',   'frequente.idSalle',  '=', 'salle.idSalle')
            ->join('classe',  'salle.idClasse',      '=', 'classe.idClasse')
            ->join('cycle',   'classe.idCycle',      '=', 'cycle.idCycle')
            ->where('frequente.matricule', $matricule)
            ->when($idAca, fn($q) => $q->where('frequente.idAcademi', $idAca))
            ->select(
                'frequente.idAcademi',
                'salle.libelle as salle_libelle',
                'classe.idClasse',
                'classe.libelle as classe_libelle',
                'cycle.idCycle',
                'cycle.libelle as cycle_libelle',
            )
            ->latest('frequente.created_at')
            ->first();

        if (!$inscription) {
            return response()->json(['message' => 'Élève non inscrit'], 404);
        }

        // 2. Trouver la scolarité du cycle
        $scolarite = DB::table('Scolarite')
            ->where('idCycle', $inscription->idCycle)
            ->first();

        if (!$scolarite) {
            return response()->json(['message' => 'Aucune scolarité configurée pour ce cycle'], 404);
        }

        // 3. Charger les tranches de la scolarité
        $tranches = DB::table('Tranches')
            ->where('idScolarite', $scolarite->idScolarite)
            ->where('actif', 1)
            ->orderBy('idTranche')
            ->get();

        // 4. Charger l'année académique pour calculer les échéances
        $annee = DB::table('AnneeAcademique')
            ->where('idAnnee', $inscription->idAcademi)
            ->first();

        preg_match('/(\d{4})/', $annee->periode ?? '', $matches);
        $anneeDebut = intval($matches[1] ?? date('Y'));

        // 5. Pour chaque tranche, récupérer l'état de paiement de l'élève
        $result = [];
        $ordre  = 1;

        foreach ($tranches as $tranche) {
            // Calculer la date d'échéance
            $mois          = intval($tranche->delai_mois);
            $jour          = intval($tranche->delai_jour);
            $anneeEcheance = $mois >= 9 ? $anneeDebut : $anneeDebut + 1;
            $dateEcheance  = Carbon::create($anneeEcheance, $mois, $jour);

            // Chercher si l'élève a déjà un suivi sur cette tranche
            $pivot = EleveTranche::where('matricule', $matricule)
                ->where('idTranche', $tranche->idTranche)
                ->where('idAca', $inscription->idAcademi)
                ->first();

            // Calculer le statut dynamiquement
            $montantPaye = $pivot?->montant_paye ?? 0;
            $statut      = 'en_attente';

            if ($montantPaye >= $tranche->montant) {
                $statut = 'payee';
            } elseif ($montantPaye > 0) {
                $statut = 'partielle';
            } elseif ($dateEcheance->isPast()) {
                $statut = 'en_retard';
            } elseif ($dateEcheance->diffInDays(now()) <= 7) {
                $statut = 'due';
            }

            $result[] = [
                'idEleveTranche' => $pivot?->idEleveTranche,
                'idTranche'      => $tranche->idTranche,
                'ordre'          => $ordre,
                'libelle'        => $tranche->libelle,
                'montant_du'     => $tranche->montant,
                'montant_paye'   => $montantPaye,
                'reste'          => max(0, $tranche->montant - $montantPaye),
                'date_echeance'  => $dateEcheance->toDateString(),
                'statut'         => $statut,
                'date_paiement'  => $pivot?->date_paiement,
            ];

            $ordre++;
        }

        $totalDu   = collect($result)->sum('montant_du');
        $totalPaye = collect($result)->sum('montant_paye');

        return response()->json([
            'inscription' => $inscription,
            'scolarite'   => $scolarite,
            'annee'       => $annee,
            'tranches'    => $result,
            'total_du'    => $totalDu,
            'total_paye'  => $totalPaye,
            'reste'       => $totalDu - $totalPaye,
            'pourcentage' => $totalDu > 0 ? round(($totalPaye / $totalDu) * 100) : 0,
        ]);
    }

    // ── Enregistrer un paiement sur une tranche ───────────────────────────────
    public function payer(Request $request)
    {
        $request->validate([
            'matricule'    => 'required|integer',
            'idTranche'    => 'required|integer',
            'idAca'        => 'required|integer',
            'montant'      => 'required|numeric|min:1',
            'idMode'       => 'required|integer',
            'idPers'       => 'required|integer',
            'operation_ID' => 'nullable|string|max:30',
            'comentaire'   => 'nullable|string|max:255',
        ]);

        // Charger la tranche pour validation
        $tranche = DB::table('Tranches')
            ->where('idTranche', $request->idTranche)
            ->first();

        if (!$tranche) {
            return response()->json(['message' => 'Tranche introuvable'], 404);
        }

        // Charger le pivot existant ou créer
        $pivot = EleveTranche::firstOrNew([
            'matricule' => $request->matricule,
            'idTranche' => $request->idTranche,
            'idAca'     => $request->idAca,
        ]);

        $dejaPayé    = $pivot->montant_paye ?? 0;
        $resteAPayer = $tranche->montant - $dejaPayé;

        // Validation séquentielle — trouver l'ordre de cette tranche
        $scolariteId = $tranche->idScolarite;
        $toutesLes   = DB::table('Tranches')
            ->where('idScolarite', $scolariteId)
            ->where('actif', 1)
            ->orderBy('idTranche')
            ->pluck('idTranche')
            ->toArray();

        $indexActuelle = array_search($request->idTranche, $toutesLes);

        if ($indexActuelle > 0) {
            $idPrecedente = $toutesLes[$indexActuelle - 1];
            $pivotPrec    = EleveTranche::where('matricule', $request->matricule)
                ->where('idTranche', $idPrecedente)
                ->where('idAca', $request->idAca)
                ->first();

            $montantPrec = DB::table('Tranches')->where('idTranche', $idPrecedente)->value('montant');

            if (!$pivotPrec || $pivotPrec->montant_paye < $montantPrec) {
                $libellePrec = DB::table('Tranches')->where('idTranche', $idPrecedente)->value('libelle');
                return response()->json([
                    'message' => "\"$libellePrec\" doit être payée en premier.",
                ], 422);
            }
        }

        if ($resteAPayer <= 0) {
            return response()->json(['message' => 'Cette tranche est déjà soldée'], 422);
        }

        if ($request->montant > $resteAPayer) {
            return response()->json([
                'message'       => "Montant dépasse le reste à payer ({$resteAPayer} FCFA)",
                'reste_a_payer' => $resteAPayer,
            ], 422);
        }

        DB::transaction(function () use ($request, $pivot, $tranche, $dejaPayé) {
            // Créer le paiement
            $idPaie = DB::table('paiement')->max('idPaie') + 1;
            DB::table('paiement')->insert([
                'idPaie'          => $idPaie,
                'matricule'       => $request->matricule,
                'idAca'           => $request->idAca,
                'montant'         => $request->montant,
                'idMode'          => $request->idMode,
                'idPers'          => $request->idPers,
                'operation_ID'    => $request->operation_ID ?? 'INDEFINI',
                'comentaire'      => $request->comentaire ?? 'Paiement ' . $tranche->libelle,
                'url'             => 'INDEFINI',
                'datePaie'        => now()->toDateString(),
                'dateEnregistrer' => now(),
            ]);

            // Mettre à jour le pivot
            $nouveauMontant = $dejaPayé + $request->montant;
            $solde          = $nouveauMontant >= $tranche->montant;

            $pivot->fill([
                'montant_paye'  => $nouveauMontant,
                'idPaie'        => $idPaie,
                'statut'        => $solde ? 'payee' : 'partielle',
                'date_paiement' => $solde ? now()->toDateString() : null,
            ])->save();

            // Notification
            $eleve = DB::table('Eleve')->where('matricule', $request->matricule)->first();
            Notification::create([
    'idPers'  => $request->idPers,
    'idAdmin' => $request->idPers,   // ← ajouter
    'titre'   => "Paiement {$tranche->libelle} — {$eleve->prenom} {$eleve->nom}",
    'message' => number_format($request->montant, 0, ',', ' ') . ' FCFA' . ($solde ? ' — Soldée ✓' : ' — Partiel'),
    'type'    => 'paiement',
    'lu'      => false,
]);
        });

        return response()->json(['message' => 'Paiement enregistré avec succès']);
    }

    // ── Stats retards globaux ─────────────────────────────────────────────────
    public function statsRetards()
    {
        // Tranches dues non payées (calculé dynamiquement)
        $retards = DB::table('eleve_tranches')
            ->join('Tranches',         'eleve_tranches.idTranche', '=', 'Tranches.idTranche')
            ->join('Eleve',            'eleve_tranches.matricule', '=', 'Eleve.matricule')
            ->whereIn('eleve_tranches.statut', ['en_retard', 'partielle'])
            ->select(
                'eleve_tranches.*',
                'Tranches.libelle as tranche_libelle',
                'Tranches.montant as montant_du',
                'Eleve.nom', 'Eleve.prenom'
            )
            ->get();

        return response()->json([
            'total'   => $retards->count(),
            'retards' => $retards,
        ]);
    }
}