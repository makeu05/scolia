<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;

class PaiementController extends Controller
{
    // Liste paginée avec filtres
    public function index(Request $request)
    {
        $query = Paiement::with(['eleve', 'anneeAcademique', 'mode']);

        if ($request->filled('matricule')) {
            $query->where('matricule', $request->matricule);
        }
        if ($request->filled('idAca')) {
            $query->where('idAca', $request->idAca);
        }
        if ($request->filled('idMode')) {
            $query->where('idMode', $request->idMode);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('eleve', function ($q) use ($search) {
                $q->where('nom',    'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('matricule', 'like', "%$search%");
            });
        }

        return response()->json($query->latest('datePaie')->paginate(15));
    }

    // Enregistrer un paiement
    public function store(Request $request)
    {
        $request->validate([
            'matricule'    => 'required|integer|exists:Eleve,matricule',
            'idAca'        => 'required|integer|exists:AnneeAcademique,idAnnee',
            'montant'      => 'required|numeric|min:0',
            'idMode'       => 'required|integer|exists:Mode,idMode',
            'datePaie'     => 'required|date',
            'idPers'       => 'required|integer',
            'operation_ID' => 'nullable|string|max:30',
            'comentaire'   => 'nullable|string|max:255',
        ]);

        $id = DB::table('Paiement')->max('idPaie') + 1;

        $paiement = Paiement::create([
            'idPaie'          => $id,
            'matricule'       => $request->matricule,
            'idAca'           => $request->idAca,
            'montant'         => $request->montant,
            'url'             => 'INDEFINI',
            'comentaire'      => $request->comentaire ?? 'RAS',
            'idMode'          => $request->idMode,
            'operation_ID'    => $request->operation_ID ?? 'INDEFINI',
            'idPers'          => $request->idPers,
            'datePaie'        => $request->datePaie,
            'dateEnregistrer' => now(),
        ]);
        NotificationService::paiement(
    "Paiement de " . number_format($paiement->montant, 0, ',', ' ') . " FCFA reçu de {$paiement->eleve->prenom} {$paiement->eleve->nom}",
    '/paiements/' . $paiement->idPaie
);

        return response()->json([
            'message'  => 'Paiement enregistré',
            'paiement' => $paiement->load(['eleve', 'mode', 'anneeAcademique'])
        ], 201);
    }

    // Détail d'un paiement
    public function show($id)
    {
        return response()->json(
            Paiement::with(['eleve', 'anneeAcademique', 'mode'])->findOrFail($id)
        );
    }

    // Modifier un paiement
    public function update(Request $request, $id)
    {
        $paiement = Paiement::findOrFail($id);

        $request->validate([
            'montant'    => 'sometimes|numeric|min:0',
            'idMode'     => 'sometimes|integer|exists:Mode,idMode',
            'datePaie'   => 'sometimes|date',
            'comentaire' => 'nullable|string|max:255',
            'operation_ID' => 'nullable|string|max:30',
        ]);

        $paiement->update($request->only([
            'montant', 'idMode', 'datePaie', 'comentaire', 'operation_ID'
        ]));

        return response()->json([
            'message'  => 'Paiement mis à jour',
            'paiement' => $paiement->load(['eleve', 'mode'])
        ]);
    }

    public function destroy($id)
    {
        Paiement::findOrFail($id)->delete();
        return response()->json(['message' => 'Paiement supprimé']);
    }

    // Suivi des paiements d'un élève pour une année
    public function suiviEleve(Request $request, $matricule)
    {
        $request->validate([
            'idAca' => 'required|integer',
        ]);

        // Paiements de l'élève
        $paiements = Paiement::with(['mode'])
            ->where('matricule', $matricule)
            ->where('idAca', $request->idAca)
            ->orderBy('datePaie')
            ->get();

        $totalPaye = $paiements->sum('montant');

        // Scolarité du cycle de l'élève
        $scolarite = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->join('Scolarite', 'Classe.idCycle', '=', 'Scolarite.idCycle')
            ->where('Frequente.matricule', $matricule)
            ->where('Frequente.idAcademi', $request->idAca)
            ->select('Scolarite.*')
            ->first();

        $montantTotal = $scolarite
            ? $scolarite->inscription + $scolarite->pension
            : 0;

        $resteAPayer = max(0, $montantTotal - $totalPaye);

        // Tranches
        $tranches = $scolarite
            ? DB::table('Tranches')
                ->where('idScolarite', $scolarite->idScolarite)
                ->where('actif', 1)
                ->get()
            : collect();

        return response()->json([
            'matricule'    => $matricule,
            'paiements'    => $paiements,
            'totalPaye'    => round($totalPaye, 0),
            'montantTotal' => round($montantTotal, 0),
            'resteAPayer'  => round($resteAPayer, 0),
            'tauxRecouvrement' => $montantTotal > 0
                ? round(($totalPaye / $montantTotal) * 100, 1)
                : 0,
            'scolarite'    => $scolarite,
            'tranches'     => $tranches,
        ]);
    }

    // Dashboard paiements
    public function dashboard(Request $request)
    {
        $request->validate([
            'idAca' => 'required|integer',
        ]);

        $idAca = $request->idAca;

        $totalCollecte = Paiement::where('idAca', $idAca)->sum('montant');
        $nbPaiements   = Paiement::where('idAca', $idAca)->count();
        $nbElevesPayes = Paiement::where('idAca', $idAca)
            ->distinct('matricule')->count('matricule');

        // Paiements par mode
        $parMode = Paiement::with('mode')
            ->where('idAca', $idAca)
            ->selectRaw('idMode, SUM(montant) as total, COUNT(*) as nb')
            ->groupBy('idMode')
            ->get();

        // Paiements récents
        $recents = Paiement::with(['eleve', 'mode'])
            ->where('idAca', $idAca)
            ->latest('datePaie')
            ->limit(10)
            ->get();

        // Élèves débiteurs (aucun paiement)
        $tousEleves = DB::table('Frequente')
            ->where('idAcademi', $idAca)
            ->pluck('matricule');

        $elevesAvecPaiement = Paiement::where('idAca', $idAca)
            ->distinct('matricule')
            ->pluck('matricule');

        $nbDebiteurs = $tousEleves->diff($elevesAvecPaiement)->count();

        return response()->json([
            'totalCollecte'  => round($totalCollecte, 0),
            'nbPaiements'    => $nbPaiements,
            'nbElevesPayes'  => $nbElevesPayes,
            'nbDebiteurs'    => $nbDebiteurs,
            'parMode'        => $parMode,
            'recents'        => $recents,
        ]);
    }

    // Stats globales
public function stats(Request $request)
{
    $request->validate(['idAca' => 'required|integer']);
    $idAca = $request->idAca;

    // Total collecté
    $totalCollecte = Paiement::where('idAca', $idAca)->sum('montant');

    // Par mode
    $parMode = DB::table('Paiement')
        ->join('Mode', 'Paiement.idMode', '=', 'Mode.idMode')
        ->where('Paiement.idAca', $idAca)
        ->selectRaw('Mode.idMode, Mode.libelle, SUM(Paiement.montant) as total, COUNT(*) as nb')
        ->groupBy('Mode.idMode', 'Mode.libelle')
        ->get();

    // Par mois
    $parMois = DB::table('Paiement')
        ->where('idAca', $idAca)
        ->selectRaw("DATE_FORMAT(datePaie, '%Y-%m') as mois, SUM(montant) as total, COUNT(*) as nb")
        ->groupBy('mois')
        ->orderBy('mois')
        ->get();

    // Par classe
    $classes = DB::table('Classe')->get();
    $parClasse = [];

    foreach ($classes as $classe) {
        // Élèves inscrits dans cette classe pour cette année
        $matricules = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->where('Salle.idClasse', $classe->idClasse)
            ->where('Frequente.idAcademi', $idAca)
            ->pluck('Frequente.matricule');

        if ($matricules->isEmpty()) continue;

        $collecte = Paiement::where('idAca', $idAca)
            ->whereIn('matricule', $matricules)
            ->sum('montant');

        // Scolarité du cycle de la classe
        $scolarite = DB::table('Scolarite')
            ->where('idCycle', $classe->idCycle)
            ->first();

        $attendu = $scolarite
            ? ($scolarite->inscription + $scolarite->pension) * $matricules->count()
            : 0;

        $parClasse[] = [
            'idClasse'          => $classe->idClasse,
            'libelle'           => $classe->libelle,
            'nbEleves'          => $matricules->count(),
            'totalCollecte'     => round($collecte, 0),
            'totalAttendu'      => round($attendu, 0),
            'tauxRecouvrement'  => $attendu > 0
                ? round(($collecte / $attendu) * 100, 1)
                : 0,
        ];
    }

    // Élèves débiteurs
    $tousEleves        = DB::table('Frequente')->where('idAcademi', $idAca)->pluck('matricule');
    $elevesAvecPaie    = Paiement::where('idAca', $idAca)->distinct('matricule')->pluck('matricule');
    $nbDebiteurs       = $tousEleves->diff($elevesAvecPaie)->count();
    $nbElevesPayes     = $elevesAvecPaie->count();

    $totalAttenduGlobal = collect($parClasse)->sum('totalAttendu');

    return response()->json([
        'parClasse'        => $parClasse,
        'parMode'          => $parMode,
        'parMois'          => $parMois,
        'totalCollecte'    => round($totalCollecte, 0),
        'totalAttendu'     => round($totalAttenduGlobal, 0),
        'tauxGlobal'       => $totalAttenduGlobal > 0
            ? round(($totalCollecte / $totalAttenduGlobal) * 100, 1)
            : 0,
        'nbElevesPayes'    => $nbElevesPayes,
        'nbDebiteurs'      => $nbDebiteurs,
    ]);
}

// Paiements par classe
public function parClasse(Request $request)
{
    $request->validate([
        'idClasse' => 'required|integer',
        'idAca'    => 'required|integer',
    ]);

    $classe = DB::table('Classe')->where('idClasse', $request->idClasse)->first();

    $matricules = DB::table('Frequente')
        ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->where('Salle.idClasse', $request->idClasse)
        ->where('Frequente.idAcademi', $request->idAca)
        ->pluck('Frequente.matricule');

    // Scolarité
    $scolarite = DB::table('Scolarite')
        ->where('idCycle', $classe->idCycle ?? 0)
        ->first();

    $montantAttendu = $scolarite
        ? $scolarite->inscription + $scolarite->pension
        : 0;

    $eleves = [];
    $totalCollecte = 0;

    foreach ($matricules as $matricule) {
        $eleve      = \App\Models\Eleve::find($matricule);
        $paiements  = Paiement::where('matricule', $matricule)
            ->where('idAca', $request->idAca)
            ->get();

        $totalPaye  = $paiements->sum('montant');
        $totalCollecte += $totalPaye;

        $eleves[] = [
            'matricule'        => $matricule,
            'nom'              => $eleve?->nom,
            'prenom'           => $eleve?->prenom,
            'totalPaye'        => round($totalPaye, 0),
            'montantAttendu'   => round($montantAttendu, 0),
            'resteAPayer'      => round(max(0, $montantAttendu - $totalPaye), 0),
            'tauxRecouvrement' => $montantAttendu > 0
                ? round(($totalPaye / $montantAttendu) * 100, 1)
                : 0,
            'nbPaiements'      => $paiements->count(),
        ];
    }

    // Trier par reste à payer décroissant (débiteurs en premier)
    usort($eleves, fn($a, $b) => $b['resteAPayer'] <=> $a['resteAPayer']);

    return response()->json([
        'classe'           => $classe,
        'eleves'           => $eleves,
        'totalCollecte'    => round($totalCollecte, 0),
        'totalAttendu'     => round($montantAttendu * count($eleves), 0),
        'tauxRecouvrement' => $montantAttendu > 0 && count($eleves) > 0
            ? round(($totalCollecte / ($montantAttendu * count($eleves))) * 100, 1)
            : 0,
    ]);
}

    
}