<?php
// app/Http/Controllers/EtablissementController.php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EtablissementController extends Controller
{
    /**
     * Récupérer la configuration de l'établissement
     * GET /api/etablissement
     */
    public function show()
    {
        $etab = Etablissement::config();

        // Ajouter l'URL complète du logo
        if ($etab->logo && $etab->logo !== 'INDEFINI') {
            $etab->logo_url = asset('storage/' . $etab->logo);
        } else {
            $etab->logo_url = null;
        }

        return response()->json($etab);
    }

    /**
     * Mettre à jour la configuration
     * POST /api/etablissement  (avec _method=PUT pour l'upload logo)
     */
    public function update(Request $request)
    {
        $etab = Etablissement::config();

        $data = $request->validate([
            'nom'                => 'sometimes|string|max:255',
            'sigle'              => 'nullable|string|max:50',
            'devise'             => 'nullable|string|max:255',
            'type_etablissement' => 'nullable|string|max:100',

            'adresse'            => 'nullable|string|max:255',
            'bp'                 => 'nullable|string|max:50',
            'telephone'          => 'nullable|string|max:50',
            'telephone2'         => 'nullable|string|max:50',
            'email'              => 'nullable|email|max:150',
            'site_web'           => 'nullable|string|max:150',
            'ville'              => 'nullable|string|max:100',
            'region'             => 'nullable|string|max:100',

            'numero_arrete'      => 'nullable|string|max:150',
            'date_arrete'        => 'nullable|date',
            'ministere'          => 'nullable|string|max:255',
            'delegation'         => 'nullable|string|max:255',
            'matricule_officiel' => 'nullable|string|max:100',
            'ordre_enseignement' => 'nullable|string|max:100',

            'signataire_nom'     => 'nullable|string|max:255',
            'signataire_titre'   => 'nullable|string|max:150',

            'pays_fr'            => 'nullable|string|max:150',
            'devise_pays_fr'     => 'nullable|string|max:150',
            'pays_en'            => 'nullable|string|max:150',
            'devise_pays_en'     => 'nullable|string|max:150',

            'logo'               => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'signature'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Upload logo
        if ($request->hasFile('logo')) {
            if ($etab->logo && Storage::disk('public')->exists($etab->logo)) {
                Storage::disk('public')->delete($etab->logo);
            }
            $data['logo'] = $request->file('logo')->store('etablissement', 'public');
        }

        // Upload signature
        if ($request->hasFile('signature')) {
            if ($etab->signataire_signature && Storage::disk('public')->exists($etab->signataire_signature)) {
                Storage::disk('public')->delete($etab->signataire_signature);
            }
            $data['signataire_signature'] = $request->file('signature')->store('etablissement', 'public');
        }

        $etab->update($data);

        // Recharger avec URL logo
        if ($etab->logo && $etab->logo !== 'INDEFINI') {
            $etab->logo_url = asset('storage/' . $etab->logo);
        }

        return response()->json([
            'message'       => 'Configuration mise à jour',
            'etablissement' => $etab,
        ]);
    }
}