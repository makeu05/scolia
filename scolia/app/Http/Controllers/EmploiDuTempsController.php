<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use App\Models\PauseCycle;
use App\Models\Activite;
use App\Models\Classe;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    // ══════════════════════════════════════════════════════════════
    // EMPLOI DU TEMPS (créneaux)
    // ══════════════════════════════════════════════════════════════

    public function index(Request $request)
    {
        $query = EmploiDuTemps::with(['cours.enseignant.personne', 'salle']);
        if ($request->filled('idClasse')) $query->where('idClasse', $request->idClasse);
        if ($request->filled('type'))     $query->where('type', $request->type);
        return response()->json($query->orderBy('jour')->orderBy('heure')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'jour'        => 'required|string',
            'heure'       => 'required|string|max:6',
            'heureFin'    => 'nullable|string|max:6',
            'idClasse'    => 'required|integer|exists:classe,idClasse',
            'idCours'     => 'nullable|integer|exists:cours,idCours',
            'idSalle'     => 'nullable|integer|exists:salle,idSalle',
            'idAdmin'     => 'required|integer',
            'type'        => 'required|in:cours,pause,activite,special',
            'libelle'     => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        // Vérifier conflit horaire (même classe, même jour, chevauchement)
        $conflit = EmploiDuTemps::where('idClasse', $data['idClasse'])
            ->where('jour', $data['jour'])
            ->where('heure', $data['heure'])
            ->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Un créneau existe déjà à cette heure pour cette classe'
            ], 422);
        }

        // Vérifier conflit de salle (même salle, même jour, même heure)
        if (!empty($data['idSalle'])) {
            $conflitSalle = EmploiDuTemps::where('idSalle', $data['idSalle'])
                ->where('jour', $data['jour'])
                ->where('heure', $data['heure'])
                ->exists();

            if ($conflitSalle) {
                return response()->json([
                    'message' => 'Cette salle est déjà occupée à ce créneau'
                ], 422);
            }
        }

        $creneau = EmploiDuTemps::create($data);
        $creneau->load(['cours.enseignant.personne', 'salle']);

        return response()->json([
            'message'  => 'Créneau ajouté',
            'creneau'  => $creneau,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $creneau = EmploiDuTemps::findOrFail($id);
        $request->validate([
            'heure'       => 'sometimes|string|max:6',
            'heureFin'    => 'nullable|string|max:6',
            'idCours'     => 'nullable|integer',
            'idSalle'     => 'nullable|integer',
            'type'        => 'sometimes|in:cours,pause,activite,special',
            'libelle'     => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $creneau->update($request->only([
            'heure', 'heureFin', 'idCours', 'idSalle',
            'type', 'libelle', 'description',
        ]));

        return response()->json([
            'message' => 'Créneau mis à jour',
            'creneau' => $creneau->fresh()->load(['cours.enseignant.personne', 'salle']),
        ]);
    }

    public function destroy($id)
    {
        EmploiDuTemps::findOrFail($id)->delete();
        return response()->json(['message' => 'Créneau supprimé']);
    }

    /**
     * Grille complète d'une classe :
     * créneaux + pauses du cycle + activités de la classe
     */
    public function parClasse($idClasse)
    {
        $classe = Classe::with('cycle')->findOrFail($idClasse);

        // Créneaux normaux
        $creneaux = EmploiDuTemps::with(['cours.enseignant.personne', 'salle'])
            ->where('idClasse', $idClasse)
            ->orderBy('heure')
            ->get()
            ->groupBy('jour');

        // Pauses du cycle (injectées dans la grille)
        $pauses = PauseCycle::where('idCycle', $classe->idCycle)
            ->where('actif', true)
            ->get();

        // Activités de la classe (récurrentes hebdo)
        $activites = Activite::where(function($q) use ($idClasse) {
                $q->where('idClasse', $idClasse)->orWhereNull('idClasse');
            })
            ->where('actif', true)
            ->whereNotNull('jourHebdo')
            ->get();

        // Construire la grille par jour
        $grille = [];
        $jours  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        foreach ($jours as $jour) {
            $slots = collect($creneaux[$jour] ?? []);

            // Injecter les pauses du cycle pour ce jour
            foreach ($pauses as $pause) {
                $joursPause = is_array($pause->jours) ? $pause->jours : json_decode($pause->jours, true);
                if (in_array($jour, $joursPause)) {
                    $slots->push([
                        'idTemps'     => 'pause_' . $pause->idPause,
                        'type'        => 'pause',
                        'libelle'     => $pause->libelle,
                        'heure'       => $pause->heureDebut,
                        'heureFin'    => $pause->heureFin,
                        'jour'        => $jour,
                        'isPause'     => true,
                    ]);
                }
            }

            // Injecter les activités récurrentes
            foreach ($activites as $act) {
                if ($act->jourHebdo === $jour) {
                    $slots->push([
                        'idTemps'     => 'act_' . $act->idActivite,
                        'type'        => 'activite',
                        'libelle'     => $act->libelle,
                        'categorie'   => $act->categorie,
                        'heure'       => $act->heureDebut,
                        'heureFin'    => $act->heureFin,
                        'lieu'        => $act->lieu,
                        'jour'        => $jour,
                        'isActivite'  => true,
                    ]);
                }
            }

            // Trier par heure
            $grille[$jour] = $slots->sortBy('heure')->values();
        }

        return response()->json([
            'classe'  => $classe,
            'grille'  => $grille,
            'pauses'  => $pauses,
            'activites' => $activites,
        ]);
    }

    // ══════════════════════════════════════════════════════════════
    // PAUSES PAR CYCLE
    // ══════════════════════════════════════════════════════════════

    public function indexPauses(Request $request)
    {
        $query = PauseCycle::query();
        if ($request->filled('idCycle')) $query->where('idCycle', $request->idCycle);
        return response()->json($query->get());
    }

    public function storePause(Request $request)
    {
        $data = $request->validate([
            'idCycle'    => 'required|integer|exists:cycle,idCycle',
            'libelle'    => 'required|string|max:60',
            'heureDebut' => 'required|string|max:6',
            'heureFin'   => 'required|string|max:6',
            'jours'      => 'required|array|min:1',
            'idAdmin'    => 'required|integer',
        ]);
        $data['jours'] = json_encode($data['jours']);

        $pause = PauseCycle::create($data);
        return response()->json(['message' => 'Pause créée', 'pause' => $pause], 201);
    }

    public function updatePause(Request $request, $id)
    {
        $pause = PauseCycle::findOrFail($id);
        if ($request->has('jours')) $request->merge(['jours' => json_encode($request->jours)]);
        $pause->update($request->only(['libelle','heureDebut','heureFin','jours','actif']));
        return response()->json(['message' => 'Pause mise à jour', 'pause' => $pause->fresh()]);
    }

    public function destroyPause($id)
    {
        PauseCycle::findOrFail($id)->delete();
        return response()->json(['message' => 'Pause supprimée']);
    }

    // ══════════════════════════════════════════════════════════════
    // ACTIVITÉS EXTRA-SCOLAIRES
    // ══════════════════════════════════════════════════════════════

    public function indexActivites(Request $request)
    {
        $query = Activite::query();
        if ($request->filled('idClasse'))  $query->where('idClasse', $request->idClasse);
        if ($request->filled('categorie')) $query->where('categorie', $request->categorie);
        return response()->json($query->orderBy('libelle')->get());
    }

    public function storeActivite(Request $request)
    {
        $data = $request->validate([
            'libelle'     => 'required|string|max:100',
            'categorie'   => 'required|in:sport,musique,theatre,club,sortie_scolaire,voyage,autre',
            'description' => 'nullable|string',
            'lieu'        => 'nullable|string|max:150',
            'idClasse'    => 'nullable|integer',
            'dateDebut'   => 'nullable|date',
            'dateFin'     => 'nullable|date|after_or_equal:dateDebut',
            'jourHebdo'   => 'nullable|string|max:20',
            'heureDebut'  => 'nullable|string|max:6',
            'heureFin'    => 'nullable|string|max:6',
            'idAdmin'     => 'required|integer',
        ]);

        $activite = Activite::create($data);
        return response()->json(['message' => 'Activité créée', 'activite' => $activite], 201);
    }

    public function updateActivite(Request $request, $id)
    {
        $activite = Activite::findOrFail($id);
        $activite->update($request->only([
            'libelle','categorie','description','lieu',
            'idClasse','dateDebut','dateFin',
            'jourHebdo','heureDebut','heureFin','actif',
        ]));
        return response()->json(['message' => 'Activité mise à jour', 'activite' => $activite->fresh()]);
    }

    public function destroyActivite($id)
    {
        Activite::findOrFail($id)->delete();
        return response()->json(['message' => 'Activité supprimée']);
    }
}