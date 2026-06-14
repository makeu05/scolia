<?php
namespace App\Http\Controllers;

use App\Models\AnneeAcademique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnneeAcademiqueController extends Controller
{
    public function index()
    {
        $annees = AnneeAcademique::with('trimestres')
            ->orderBy('idAnnee', 'desc')
            ->get();
        return response()->json($annees);
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'libelle' => 'required|string|max:200',
        'periode' => 'required|string|max:255',
        'idAdmin' => 'required|integer',
    ]);

    $data['idAnnee']    = (AnneeAcademique::max('idAnnee') ?? 0) + 1;
    $data['statut']     = 'brouillon';
    $data['created_at'] = now()->toDateString();

    $annee = AnneeAcademique::create($data);

    // ✅ 3 trimestres + 2 sessions chacun
    $config = [
        ['libelle' => '1er Trimestre',  'periode' => 'Octobre - Décembre',  'sessions' => ['Séquence 1', 'Séquence 2']],
        ['libelle' => '2ème Trimestre', 'periode' => 'Janvier - Mars',      'sessions' => ['Séquence 3', 'Séquence 4']],
        ['libelle' => '3ème Trimestre', 'periode' => 'Avril - Juillet',     'sessions' => ['Séquence 5', 'Séquence 6']],
    ];

    $idTrimes  = DB::table('trimestre')->max('idTrimes') ?? 0;
    $idSession = DB::table('session')->max('idSession') ?? 0;
    $idPers    = $request->idAdmin; // utiliser idAdmin comme idPers par défaut

    foreach ($config as $tri) {
        $idTrimes++;

        DB::table('trimestre')->insert([
            'idTrimes' => $idTrimes,
            'libelle'  => $tri['libelle'],
            'periode'  => $tri['periode'],
            'idAca'    => $annee->idAnnee,
            'idAdmin'  => $data['idAdmin'],
        ]);

        foreach ($tri['sessions'] as $sessionLibelle) {
            $idSession++;
            DB::table('session')->insert([
                'idSession'   => $idSession,
                'libelle'     => $sessionLibelle,
                'description' => null,
                'idTrimestre' => $idTrimes,
                'idPers'      => $idPers,
                'created_at'  => now(),
            ]);
        }
    }

    return response()->json([
        'message' => 'Année créée avec 3 trimestres et 6 sessions automatiquement',
        'annee'   => $annee->load('trimestres'),
    ], 201);
}

    public function show($id)
    {
        $annee = AnneeAcademique::with('trimestres')->findOrFail($id);
        return response()->json($annee);
    }

    public function update(Request $request, $id)
    {
        $annee = AnneeAcademique::findOrFail($id);
        if ($annee->statut === 'cloturee') {
            return response()->json(['message' => 'Année clôturée — modification impossible'], 422);
        }
        $request->validate([
            'libelle' => 'sometimes|string|max:200',
            'periode' => 'sometimes|string|max:255',
        ]);
        $annee->update($request->only(['libelle', 'periode']));
        return response()->json(['message' => 'Mise à jour', 'annee' => $annee]);
    }

    public function destroy($id)
    {
        $annee = AnneeAcademique::findOrFail($id);
        if ($annee->statut === 'cloturee') {
            return response()->json(['message' => 'Impossible de supprimer une année clôturée'], 422);
        }
        if ($annee->trimestres()->count() > 0) {
            return response()->json(['message' => 'Impossible : des trimestres sont liés'], 422);
        }
        $annee->delete();
        return response()->json(['message' => 'Supprimée']);
    }

    // ── Activer une année ────────────────────────────────────────────────────
    public function activer($id)
    {
        $annee = AnneeAcademique::findOrFail($id);
        if ($annee->statut === 'cloturee') {
            return response()->json(['message' => 'Impossible d\'activer une année clôturée'], 422);
        }

        // Désactiver toutes les autres années actives
        AnneeAcademique::where('statut', 'active')->update(['statut' => 'brouillon']);

        $annee->update(['statut' => 'active']);
        return response()->json(['message' => 'Année activée', 'annee' => $annee]);
    }

    // ── Clôturer une année ───────────────────────────────────────────────────
    public function cloturer($id)
    {
        $annee = AnneeAcademique::findOrFail($id);

        if ($annee->statut === 'cloturee') {
            return response()->json(['message' => 'Année déjà clôturée'], 422);
        }

        $annee->update([
            'statut'       => 'cloturee',
            'date_cloture' => now()->toDateString(),
        ]);

        return response()->json(['message' => 'Année clôturée avec succès', 'annee' => $annee]);
    }

    // ── Dashboard d'une année ────────────────────────────────────────────────
    public function dashboard($id)
    {
        $annee = AnneeAcademique::with('trimestres')->findOrFail($id);

        // Élèves inscrits
        $elevesInscrits = DB::table('frequente')
            ->where('idAcademi', $id)
            ->distinct('matricule')
            ->count('matricule');

        // Élèves par classe
        $parClasse = DB::table('frequente')
            ->join('salle',  'frequente.idSalle',  '=', 'salle.idSalle')
            ->join('classe', 'salle.idClasse',      '=', 'classe.idClasse')
            ->where('frequente.idAcademi', $id)
            ->select('classe.idClasse', 'classe.libelle as classe', DB::raw('COUNT(*) as nb_eleves'))
            ->groupBy('classe.idClasse', 'classe.libelle')
            ->orderByDesc('nb_eleves')
            ->get();

        // Paiements
        $totalPaiements = DB::table('paiement')
            ->where('idAca', $id)
            ->sum('montant');

        $nbPaiements = DB::table('paiement')
            ->where('idAca', $id)
            ->count();

        // Tranches payées
        $tranchesSoldees = DB::table('eleve_tranches')
            ->where('idAca', $id)
            ->where('statut', 'payee')
            ->count();

        $tranchesTotal = DB::table('eleve_tranches')
            ->where('idAca', $id)
            ->count();

        // Absences
        $totalAbsences = DB::table('absence')
            ->where('idAca', $id)
            ->count();

        $absencesNonJustifiees = DB::table('absence')
            ->where('idAca', $id)
            ->where('statut', 'non_justifiee')
            ->count();

        // Résultats par trimestre
        $resultatsTrimestriels = [];
        foreach ($annee->trimestres as $trimestre) {
            $sessions = DB::table('session')
                ->where('idTrimestre', $trimestre->idTrimes)
                ->pluck('idSession');

            $nbEvalues = DB::table('evaluation')
                ->whereIn('idSession', $sessions)
                ->distinct('matricule')
                ->count('matricule');

            $moyenneGlobale = null;
            if ($sessions->count() > 0) {
                $moyenneGlobale = DB::table('evaluation')
                    ->whereIn('idSession', $sessions)
                    ->avg('note');
            }

            $resultatsTrimestriels[] = [
                'trimestre'       => $trimestre->libelle,
                'idTrimes'        => $trimestre->idTrimes,
                'nb_evalues'      => $nbEvalues,
                'moyenne_globale' => $moyenneGlobale ? round($moyenneGlobale, 2) : null,
            ];
        }

        return response()->json([
            'annee'                  => $annee,
            'eleves_inscrits'        => $elevesInscrits,
            'par_classe'             => $parClasse,
            'total_paiements'        => round($totalPaiements, 0),
            'nb_paiements'           => $nbPaiements,
            'tranches_soldees'       => $tranchesSoldees,
            'tranches_total'         => $tranchesTotal,
            'taux_recouvrement'      => $tranchesTotal > 0
                ? round(($tranchesSoldees / $tranchesTotal) * 100, 1)
                : 0,
            'total_absences'         => $totalAbsences,
            'absences_non_justifiees'=> $absencesNonJustifiees,
            'resultats_trimestriels' => $resultatsTrimestriels,
        ]);
    }

    // ── Liste élèves d'une année ─────────────────────────────────────────────
    public function eleves($id)
    {
        $eleves = DB::table('frequente')
            ->join('eleve',  'frequente.matricule', '=', 'eleve.matricule')
            ->join('salle',  'frequente.idSalle',   '=', 'salle.idSalle')
            ->join('classe', 'salle.idClasse',       '=', 'classe.idClasse')
            ->where('frequente.idAcademi', $id)
            ->select(
                'eleve.matricule', 'eleve.nom', 'eleve.prenom',
                'eleve.sexe', 'eleve.photoURL',
                'classe.libelle as classe',
                'salle.libelle as salle',
            )
            ->orderBy('classe.libelle')
            ->orderBy('eleve.nom')
            ->get();

        return response()->json($eleves);
    }
}