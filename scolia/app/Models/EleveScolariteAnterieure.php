<?php

namespace App\Models;

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class EleveScolariteAnterieure extends Model
{
    protected $table      = 'eleve_scolarite_anterieure';
    protected $primaryKey = 'idScolariteAnt';
    protected $fillable   = [
        'matricule', 'etablissement_nom', 'etablissement_ville', 'etablissement_type',
        'classe_precedente', 'annee_scolaire', 'moyenne_annuelle', 'appreciation',
        'redoublant', 'motif_depart', 'bulletins',
    ];
    protected $casts = [
        'redoublant' => 'boolean',
        'bulletins'  => 'array',
    ];
 
    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
}