<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


namespace App\Http\Controllers;

use App\Models\FraisAnnexe;
use App\Models\PaiementFrais;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FraisAnnexeController extends Controller
{
    // ── Liste des frais (filtrables) ──────────────────────────────────────────
    public function index(Request $request)
    {
        $query = FraisAnnexe::where('actif', true);

        if ($request->filled('idCycle'))   $query->where(fn($q) => $q->where('idCycle', $request->idCycle)->orWhereNull('idCycle'));
        if ($request->filled('idClasse'))  $query->where(fn($q) => $q->where('idClasse', $request->idClasse)->orWhereNull('idClasse'));
        if ($request->filled('idSection')) $query->where(fn($q) => $q->where('idSection', $request->idSection)->orWhereNull('idSection'));
        if ($request->filled('idAca'))     $query->where(fn($q) => $q->where('idAca', $request->idAca)->orWhereNull('idAca'));

        return response()->json($query->orderBy('libelle')->get());
    }

    // ── Créer un frais ────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:100',
            'type'        => 'required|in:examen,tenue,transport,inscription_examen,assurance,autre',
            'montant'     => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'idCycle'     => 'nullable|integer',
            'idClasse'    => 'nullable|integer',
            'idSection'   => 'nullable|integer',
            'idAca'       => 'nullable|integer',
            'obligatoire' => 'boolean',
            'idAdmin'     => 'required|integer',
        ]);

        $frais = FraisAnnexe::create($request->all());
        return response()->json(['message' => 'Frais créé', 'frais' => $frais], 201);
    }

    public function update(Request $request, $id)
    {
        $frais = FraisAnnexe::findOrFail($id);
        $frais->update($request->only(['libelle', 'type', 'montant', 'description', 'obligatoire', 'actif']));
        return response()->json(['message' => 'Frais mis à jour', 'frais' => $frais->fresh()]);
    }

    public function destroy($id)
    {
        FraisAnnexe::findOrFail($id)->update(['actif' => false]);
        return response()->json(['message' => 'Frais désactivé']);
    }

    // ── Frais applicables à un élève ──────────────────────────────────────────
    public function parEleve(Request $request, $matricule)
    {
        $idAca = $request->query('idAca');

        // Récupérer l'inscription de l'élève
        $inscription = DB::table('frequente')
            ->join('salle',  'frequente.idSalle',  '=', 'salle.idSalle')
            ->join('classe', 'salle.idClasse',     '=', 'classe.idClasse')
            ->where('frequente.matricule', $matricule)
            ->when($idAca, fn($q) => $q->where('frequente.idAcademi', $idAca))
            ->select('classe.idClasse', 'classe.idCycle', 'classe.idSection', 'frequente.idAcademi')
            ->latest('frequente.created_at')
            ->first();

        if (!$inscription) {
            return response()->json(['message' => 'Élève non inscrit'], 404);
        }

        // Frais applicables : globaux OU pour ce cycle OU cette classe OU cette section
        $frais = FraisAnnexe::where('actif', true)
            ->where(function ($q) use ($inscription) {
                $q->whereNull('idCycle')
                  ->orWhere('idCycle', $inscription->idCycle);
            })
            ->where(function ($q) use ($inscription) {
                $q->whereNull('idClasse')
                  ->orWhere('idClasse', $inscription->idClasse);
            })
            ->where(function ($q) use ($inscription) {
                $q->whereNull('idSection')
                  ->orWhere('idSection', $inscription->idSection);
            })
            ->where(function ($q) use ($inscription) {
                $q->whereNull('idAca')
                  ->orWhere('idAca', $inscription->idAcademi);
            })
            ->get();

        // Pour chaque frais, vérifier si l'élève a déjà payé
        $result = $frais->map(function ($f) use ($matricule, $inscription) {
            $paiement = PaiementFrais::where('matricule', $matricule)
                ->where('idFrais', $f->idFrais)
                ->where('idAca', $inscription->idAcademi)
                ->first();

            return [
                'idFrais'      => $f->idFrais,
                'libelle'      => $f->libelle,
                'type'         => $f->type,
                'montant'      => $f->montant,
                'description'  => $f->description,
                'obligatoire'  => $f->obligatoire,
                'statut'       => $paiement ? 'paye' : 'non_paye',
                'montant_paye' => $paiement?->montant_paye ?? 0,
                'date_paiement'=> $paiement?->date_paiement,
                'idPaieFrais'  => $paiement?->idPaieFrais,
            ];
        });

        $totalFrais = $result->sum('montant');
        $totalPaye  = $result->sum('montant_paye');

        return response()->json([
            'frais'       => $result,
            'total_frais' => $totalFrais,
            'total_paye'  => $totalPaye,
            'reste'       => $totalFrais - $totalPaye,
        ]);
    }

    // ── Payer un frais annexe ─────────────────────────────────────────────────
    public function payer(Request $request)
    {
        $request->validate([
            'matricule'    => 'required|integer',
            'idFrais'      => 'required|integer',
            'idAca'        => 'required|integer',
            'idMode'       => 'required|integer',
            'idPers'       => 'required|integer',
            'operation_ID' => 'nullable|string|max:30',
            'comentaire'   => 'nullable|string|max:255',
        ]);

        $frais = FraisAnnexe::findOrFail($request->idFrais);

        // Vérifier si déjà payé
        $dejaPaye = PaiementFrais::where('matricule', $request->matricule)
            ->where('idFrais', $request->idFrais)
            ->where('idAca', $request->idAca)
            ->exists();

        if ($dejaPaye) {
            return response()->json(['message' => 'Ce frais est déjà payé pour cet élève'], 422);
        }

        DB::transaction(function () use ($request, $frais) {
            // Créer le paiement
            $idPaie = DB::table('paiement')->max('idPaie') + 1;
            DB::table('paiement')->insert([
                'idPaie'          => $idPaie,
                'matricule'       => $request->matricule,
                'idAca'           => $request->idAca,
                'montant'         => $frais->montant,
                'idMode'          => $request->idMode,
                'idPers'          => $request->idPers,
                'operation_ID'    => $request->operation_ID ?? 'INDEFINI',
                'comentaire'      => $request->comentaire ?? $frais->libelle,
                'url'             => 'INDEFINI',
                'datePaie'        => now()->toDateString(),
                'dateEnregistrer' => now(),
            ]);

            // Enregistrer dans pivot
            PaiementFrais::create([
                'matricule'     => $request->matricule,
                'idFrais'       => $request->idFrais,
                'idAca'         => $request->idAca,
                'montant_paye'  => $frais->montant,
                'idPaie'        => $idPaie,
                'idPers'        => $request->idPers,
                'date_paiement' => now()->toDateString(),
                'operation_ID'  => $request->operation_ID ?? 'INDEFINI',
                'comentaire'    => $request->comentaire,
            ]);
        });

        return response()->json(['message' => "{$frais->libelle} payé avec succès"]);
    }
}