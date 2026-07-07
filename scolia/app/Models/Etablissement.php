<?php
// app/Models/Etablissement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $table = 'etablissement';
    protected $primaryKey = 'idEtablissement';
    public $incrementing = false;

    protected $fillable = [
        'nom', 'sigle', 'devise', 'logo', 'type_etablissement',
        'adresse', 'bp', 'telephone', 'telephone2', 'email', 'site_web', 'ville', 'region',
        'numero_arrete', 'date_arrete', 'ministere', 'delegation', 'matricule_officiel', 'ordre_enseignement',
        'signataire_nom', 'signataire_titre', 'signataire_signature',
        'pays_fr', 'devise_pays_fr', 'pays_en', 'devise_pays_en',
        'idAdmin',
    ];

    protected $casts = [
        'date_arrete' => 'date',
    ];

    // Helper : toujours récupérer LA config (ligne 1), la créer si absente
    public static function config()
    {
        return static::firstOrCreate(
            ['idEtablissement' => 1],
            ['nom' => 'Mon Établissement Scolaire']
        );
    }
}