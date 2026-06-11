<?php
namespace App\Http\Controllers\Eleve;

use App\Http\Controllers\Controller;
use App\Models\Eleve;
use App\Models\EleveSante;
use App\Models\EleveScolariteAnterieure;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EleveController extends Controller
{
    // ── Liste ─────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Eleve::query(); // ✅ supprimé with('villeNaissance')

        if ($request->filled('idClasse')) {
            $query->whereHas('frequente', fn($q) =>
                $q->whereHas('salle', fn($q2) =>
                    $q2->where('idClasse', $request->idClasse)
                )
            );
        }
        if ($request->filled('idCycle')) {
            $query->whereHas('frequente', fn($q) =>
                $q->whereHas('salle.classe', fn($q2) =>
                    $q2->where('idCycle', $request->idCycle)
                )
            );
        }
        if ($request->filled('actif'))  $query->where('actif', $request->actif);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('nom',        'like', "%$s%")
                  ->orWhere('prenom',   'like', "%$s%")
                  ->orWhere('matricule','like', "%$s%")
            );
        }

        return response()->json($query->paginate(15));
    }

    // ── Créer ─────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            // Infos de base
            'nom'           => 'required|string|max:60',
            'prenom'        => 'required|string|max:60',
            'dateNaissance' => 'required|date',
            'lieuNaissance' => 'required|string|max:30',
            'sexe'          => 'required|integer|in:0,1,2',
            'langue'        => 'nullable|string|max:30',
            'idAdmin'       => 'required|integer',
            'photo'         => 'nullable|image|max:2048',
            // ✅ idVilleNaissance supprimé
            // Infos supplémentaires
            'religion'             => 'nullable|string|max:50',
            'situation_familiale'  => 'nullable|string',
            'contact_urgence_nom'  => 'nullable|string|max:100',
            'contact_urgence_tel'  => 'nullable|string|max:20',
            'contact_urgence_lien' => 'nullable|string|max:50',
            'tuteur_nom'           => 'nullable|string|max:100',
            'tuteur_tel'           => 'nullable|string|max:20',
            'tuteur_profession'    => 'nullable|string|max:100',
        ]);

        // Matricule auto
        $annee      = date('Y');
        $dernierMat = DB::table('Eleve')->where('matricule', 'like', $annee.'%')->max('matricule');
        $sequence   = $dernierMat ? intval(substr((string)$dernierMat, 4)) + 1 : 1;
        $matricule  = intval($annee . str_pad($sequence, 4, '0', STR_PAD_LEFT));

        // Photo
        if ($request->hasFile('photo')) {
            $data['photoURL'] = asset('storage/' . $request->file('photo')->store('photos/eleves', 'public'));
        } else {
            $data['photoURL'] = null;
        }

        $data['matricule'] = $matricule;
        $data['actif']     = 1;
        $data['nom']       = strtoupper($data['nom']);

        $eleve = Eleve::create($data);

        // Créer fiche santé vide
        EleveSante::create(['matricule' => $matricule]);

        NotificationService::eleve(
            "Nouvel élève : {$eleve->prenom} {$eleve->nom} (#{$matricule})",
            '/eleves/' . $matricule
        );

        return response()->json(['message' => 'Élève créé', 'eleve' => $eleve], 201);
    }

    // ── Détail ────────────────────────────────────────────────────────────────
    public function show($matricule)
    {
        // ✅ supprimé villeNaissance, sante, scolariteAnterieure du with()
        // Ces données sont chargées par leurs endpoints dédiés
        $eleve = Eleve::with([
            'parents.personne',
        ])->findOrFail($matricule);

        return response()->json($eleve);
    }

    // ── Modifier ──────────────────────────────────────────────────────────────
    public function update(Request $request, $matricule)
    {
        $eleve = Eleve::findOrFail($matricule);

        $data = $request->validate([
            'nom'                  => 'sometimes|string|max:60',
            'prenom'               => 'sometimes|string|max:60',
            'dateNaissance'        => 'sometimes|date',
            'lieuNaissance'        => 'sometimes|string|max:30',
            'sexe'                 => 'sometimes|integer|in:0,1,2',
            'langue'               => 'nullable|string|max:30',
            'photo'                => 'nullable|image|max:2048',
            // ✅ idVilleNaissance supprimé
            'religion'             => 'nullable|string|max:50',
            'situation_familiale'  => 'nullable|string',
            'contact_urgence_nom'  => 'nullable|string|max:100',
            'contact_urgence_tel'  => 'nullable|string|max:20',
            'contact_urgence_lien' => 'nullable|string|max:50',
            'tuteur_nom'           => 'nullable|string|max:100',
            'tuteur_tel'           => 'nullable|string|max:20',
            'tuteur_profession'    => 'nullable|string|max:100',
        ]);
        $nullables = [
    'religion', 'situation_familiale',
    'contact_urgence_nom', 'contact_urgence_tel', 'contact_urgence_lien',
    'tuteur_nom', 'tuteur_tel', 'tuteur_profession',
];
foreach ($nullables as $field) {
    if (isset($data[$field]) && $data[$field] === '') {
        $data[$field] = null;
    }
}
        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo
            if ($eleve->photoURL && !str_starts_with($eleve->photoURL, 'http') && $eleve->photoURL !== 'INDEFINI') {
                Storage::disk('public')->delete($eleve->photoURL);
            }
            $data['photoURL'] = asset('storage/' . $request->file('photo')->store('photos/eleves', 'public'));
        }

        $eleve->update($data);
        return response()->json(['message' => 'Élève mis à jour', 'eleve' => $eleve]);
    }

    // ── Santé : lire ──────────────────────────────────────────────────────────
    public function getSante($matricule)
    {
        $sante = EleveSante::firstOrCreate(['matricule' => $matricule]);
        return response()->json($sante);
    }

    // ── Santé : mettre à jour ─────────────────────────────────────────────────
    public function updateSante(Request $request, $matricule)
    {
        $request->validate([
            'groupe_sanguin'      => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-,inconnu',
            'handicap'            => 'boolean',
            'type_handicap'       => 'nullable|string|max:150',
            'allergies'           => 'nullable|string',
            'antecedents'         => 'nullable|string',
            'traitement_en_cours' => 'boolean',
            'details_traitement'  => 'nullable|string',
            'vaccins'             => 'nullable|array',
            'medecin_nom'         => 'nullable|string|max:100',
            'medecin_tel'         => 'nullable|string|max:20',
            'assurance_nom'       => 'nullable|string|max:100',
            'assurance_numero'    => 'nullable|string|max:50',
        ]);

        $sante = EleveSante::updateOrCreate(
            ['matricule' => $matricule],
            $request->only([
                'groupe_sanguin', 'handicap', 'type_handicap',
                'allergies', 'antecedents', 'traitement_en_cours', 'details_traitement',
                'vaccins', 'medecin_nom', 'medecin_tel', 'assurance_nom', 'assurance_numero',
            ])
        );

        return response()->json(['message' => 'Fiche santé mise à jour', 'sante' => $sante]);
    }

    // ── Scolarité antérieure : lire ───────────────────────────────────────────
    public function getScolariteAnterieure($matricule)
    {
        $scol = EleveScolariteAnterieure::where('matricule', $matricule)
            ->orderByDesc('annee_scolaire')
            ->get();
        return response()->json($scol);
    }

    // ── Scolarité antérieure : ajouter ────────────────────────────────────────
    public function storeScolariteAnterieure(Request $request, $matricule)
    {
        $data = $request->validate([
            'etablissement_nom'   => 'required|string|max:150',
            'etablissement_ville' => 'nullable|string|max:100',
            'etablissement_type'  => 'nullable|string|max:50',
            'classe_precedente'   => 'nullable|string|max:60',
            'annee_scolaire'      => 'nullable|string|max:20',
            'moyenne_annuelle'    => 'nullable|numeric|min:0|max:20',
            'appreciation'        => 'nullable|string|max:100',
            'redoublant'          => 'boolean',
            'motif_depart'        => 'nullable|string|max:255',
        ]);

        $data['matricule'] = $matricule;
        $scol = EleveScolariteAnterieure::create($data);
        return response()->json(['message' => 'Scolarité antérieure ajoutée', 'data' => $scol], 201);
    }

    // ── Bulletin antérieur : upload ───────────────────────────────────────────
    public function uploadBulletin(Request $request, $matricule, $idScolariteAnt)
    {
        $request->validate([
            'bulletin' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'annee'    => 'nullable|string|max:20',
        ]);

        $scol = EleveScolariteAnterieure::findOrFail($idScolariteAnt);
        $file = $request->file('bulletin');
        $path = $file->store("bulletins/{$matricule}", 'public');

        $bulletins   = $scol->bulletins ?? [];
        $bulletins[] = [
            'nom'   => $file->getClientOriginalName(),
            'path'  => $path,
            'url'   => asset('storage/' . $path),
            'annee' => $request->annee ?? $scol->annee_scolaire,
        ];

        $scol->update(['bulletins' => $bulletins]);
        return response()->json(['message' => 'Bulletin uploadé', 'bulletins' => $bulletins]);
    }

    // ── Supprimer scolarité antérieure ────────────────────────────────────────
    public function destroyScolariteAnterieure($matricule, $idScolariteAnt)
    {
        EleveScolariteAnterieure::where('matricule', $matricule)
            ->where('idScolariteAnt', $idScolariteAnt)
            ->delete();
        return response()->json(['message' => 'Supprimé']);
    }

    // ── Archiver ──────────────────────────────────────────────────────────────
    public function archiver($matricule)
    {
        Eleve::findOrFail($matricule)->update(['actif' => 0]);
        return response()->json(['message' => 'Élève archivé']);
    }

    // ── Réactiver ─────────────────────────────────────────────────────────────
    public function reactiver($matricule)
    {
        Eleve::findOrFail($matricule)->update(['actif' => 1]);
        return response()->json(['message' => 'Élève réactivé']);
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    public function destroy($matricule)
    {
        Eleve::findOrFail($matricule)->delete();
        return response()->json(['message' => 'Élève supprimé']);
    }
}