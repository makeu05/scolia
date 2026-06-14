<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsenceController extends Controller
{
    // ── Liste des absences (filtrable) ───────────────────────────────────────
    public function index(Request $request)
    {
        $query = DB::table('absence')
            ->join('Eleve',  'absence.matricule', '=', 'Eleve.matricule')
            ->leftJoin('cours', 'absence.idCours', '=', 'cours.idCours')
            ->when($request->idAca,       fn($q) => $q->where('absence.idAca', $request->idAca))
            ->when($request->matricule,   fn($q) => $q->where('absence.matricule', $request->matricule))
            ->when($request->statut,      fn($q) => $q->where('absence.statut', $request->statut))
            ->when($request->mode,        fn($q) => $q->where('absence.mode', $request->mode))
            ->when($request->date_debut,  fn($q) => $q->where('absence.date_absence', '>=', $request->date_debut))
            ->when($request->date_fin,    fn($q) => $q->where('absence.date_absence', '<=', $request->date_fin))
            ->when($request->idCours,     fn($q) => $q->where('absence.idCours', $request->idCours))
            ->select(
                'absence.*',
                'Eleve.nom', 'Eleve.prenom',
                'cours.libelle as cours_libelle',
            )
            ->orderByDesc('absence.date_absence')
            ->paginate(20);

        return response()->json($query);
    }

    // ── Saisir une absence (individuelle) ────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'matricule'    => 'required|integer',
            'idAca'        => 'required|integer',
            'date_absence' => 'required|date',
            'mode'         => 'required|in:journee,seance',
            'statut'       => 'required|in:non_justifiee,justifiee,retard',
            'idCours'      => 'nullable|integer',
            'motif'        => 'nullable|string|max:255',
            'nb_heures'    => 'nullable|integer|min:1',
            'idPers'       => 'required|integer',
        ]);

        // Vérifier doublon
        $existe = DB::table('absence')
            ->where('matricule',    $request->matricule)
            ->where('date_absence', $request->date_absence)
            ->where('idCours',      $request->idCours)
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Absence déjà enregistrée pour cet élève ce jour'], 422);
        }

        $id = DB::table('absence')->insertGetId([
            'matricule'     => $request->matricule,
            'idAca'         => $request->idAca,
            'date_absence'  => $request->date_absence,
            'mode'          => $request->mode,
            'statut'        => $request->statut,
            'idCours'       => $request->idCours,
            'motif'         => $request->motif,
            'nb_heures'     => $request->nb_heures ?? 1,
            'idPers'        => $request->idPers,
            'parent_notifie'=> false,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Notifier les parents
        $this->notifierParents($request->matricule, $request->date_absence, $request->statut, $request->idPers);

        return response()->json(['message' => 'Absence enregistrée', 'idAbsence' => $id], 201);
    }

    // ── Saisie en masse (toute une classe pour une séance) ───────────────────
    public function storeBulk(Request $request)
    {
        $request->validate([
            'absences'               => 'required|array|min:1',
            'absences.*.matricule'   => 'required|integer',
            'absences.*.statut'      => 'required|in:non_justifiee,justifiee,retard',
            'absences.*.motif'       => 'nullable|string',
            'idAca'                  => 'required|integer',
            'date_absence'           => 'required|date',
            'mode'                   => 'required|in:journee,seance',
            'idCours'                => 'nullable|integer',
            'idPers'                 => 'required|integer',
        ]);

        $created = 0;
        foreach ($request->absences as $abs) {
            $existe = DB::table('absence')
                ->where('matricule',    $abs['matricule'])
                ->where('date_absence', $request->date_absence)
                ->where('idCours',      $request->idCours)
                ->exists();

            if (!$existe) {
                DB::table('absence')->insert([
                    'matricule'     => $abs['matricule'],
                    'idAca'         => $request->idAca,
                    'date_absence'  => $request->date_absence,
                    'mode'          => $request->mode,
                    'statut'        => $abs['statut'],
                    'idCours'       => $request->idCours,
                    'motif'         => $abs['motif'] ?? null,
                    'nb_heures'     => $abs['nb_heures'] ?? 1,
                    'idPers'        => $request->idPers,
                    'parent_notifie'=> false,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
                $created++;
                $this->notifierParents($abs['matricule'], $request->date_absence, $abs['statut'], $request->idPers);
            }
        }

        return response()->json(['message' => "$created absence(s) enregistrée(s)"], 201);
    }

    // ── Modifier (justifier, changer statut) ─────────────────────────────────
    public function update(Request $request, $id)
    {
        $request->validate([
            'statut' => 'sometimes|in:non_justifiee,justifiee,retard',
            'motif'  => 'nullable|string|max:255',
        ]);

        DB::table('absence')->where('idAbsence', $id)->update(
            array_merge($request->only(['statut', 'motif']), ['updated_at' => now()])
        );

        return response()->json(['message' => 'Absence mise à jour']);
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    public function destroy($id)
    {
        DB::table('absence')->where('idAbsence', $id)->delete();
        return response()->json(['message' => 'Absence supprimée']);
    }

    // ── Absences d'un élève ───────────────────────────────────────────────────
    public function parEleve(Request $request, $matricule)
    {
        $absences = DB::table('absence')
            ->leftJoin('cours', 'absence.idCours', '=', 'cours.idCours')
            ->where('absence.matricule', $matricule)
            ->when($request->idAca, fn($q) => $q->where('absence.idAca', $request->idAca))
            ->select('absence.*', 'cours.libelle as cours_libelle')
            ->orderByDesc('date_absence')
            ->get();

        $stats = [
            'total'         => $absences->count(),
            'non_justifiees'=> $absences->where('statut', 'non_justifiee')->count(),
            'justifiees'    => $absences->where('statut', 'justifiee')->count(),
            'retards'       => $absences->where('statut', 'retard')->count(),
            'total_heures'  => $absences->sum('nb_heures'),
        ];

        return response()->json(['absences' => $absences, 'stats' => $stats]);
    }

    // ── Stats globales ────────────────────────────────────────────────────────
    public function stats(Request $request)
    {
        $idAca = $request->idAca;

        $total = DB::table('absence')->when($idAca, fn($q) => $q->where('idAca', $idAca))->count();
        $parStatut = DB::table('absence')
            ->when($idAca, fn($q) => $q->where('idAca', $idAca))
            ->select('statut', DB::raw('COUNT(*) as total'))
            ->groupBy('statut')->get();

        $plusAbsents = DB::table('absence')
            ->join('Eleve', 'absence.matricule', '=', 'Eleve.matricule')
            ->when($idAca, fn($q) => $q->where('absence.idAca', $idAca))
            ->select('absence.matricule', 'Eleve.nom', 'Eleve.prenom', DB::raw('COUNT(*) as nb_absences'))
            ->groupBy('absence.matricule', 'Eleve.nom', 'Eleve.prenom')
            ->orderByDesc('nb_absences')
            ->limit(10)->get();

        return response()->json([
            'total'        => $total,
            'par_statut'   => $parStatut,
            'plus_absents' => $plusAbsents,
        ]);
    }

    // ── Notifier les parents ──────────────────────────────────────────────────
    private function notifierParents(int $matricule, string $date, string $statut, int $idPers): void
    {
        $eleve   = DB::table('Eleve')->where('matricule', $matricule)->first();
        $parents = DB::table('parents')->where('matricule', $matricule)->pluck('idPers');

        $statut_label = match($statut) {
            'non_justifiee' => 'non justifiée',
            'justifiee'     => 'justifiée',
            'retard'        => 'retard',
            default         => $statut,
        };

        $dateFormatee = date('d/m/Y', strtotime($date));

        foreach ($parents as $idParent) {
            Notification::create([
                'idPers'  => $idParent,
                'idAdmin' => $idPers,
                'titre'   => "Absence de {$eleve->prenom} {$eleve->nom}",
                'message' => "Votre enfant a été absent(e) le {$dateFormatee} (absence {$statut_label}).",
                'type'    => 'absence',
                'lu'      => false,
            ]);
        }

        DB::table('absence')
            ->where('matricule', $matricule)
            ->where('date_absence', $date)
            ->update(['parent_notifie' => true, 'parent_notifie_at' => now()]);
    }
}