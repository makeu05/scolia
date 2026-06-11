<?php
// ── app/Models/EleveSante.php ─────────────────────────────────────────────────
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class EleveSante extends Model
{
    protected $table      = 'eleve_sante';
    protected $primaryKey = 'idSante';
    protected $fillable   = [
        'matricule', 'groupe_sanguin', 'handicap', 'type_handicap',
        'allergies', 'antecedents', 'traitement_en_cours', 'details_traitement',
        'vaccins', 'medecin_nom', 'medecin_tel', 'assurance_nom', 'assurance_numero',
    ];
    protected $casts = [
        'handicap'            => 'boolean',
        'traitement_en_cours' => 'boolean',
        'vaccins'             => 'array',
    ];
 
    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
}