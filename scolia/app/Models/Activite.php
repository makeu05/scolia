<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class Activite extends Model
{
    protected $table      = 'activites';
    protected $primaryKey = 'idActivite';
 
    protected $fillable = [
        'libelle', 'categorie', 'description', 'lieu',
        'idClasse', 'dateDebut', 'dateFin',
        'jourHebdo', 'heureDebut', 'heureFin', 'actif', 'idAdmin',
    ];
 
    protected $casts = [
        'dateDebut' => 'date',
        'dateFin'   => 'date',
        'actif'     => 'boolean',
    ];
 
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'idClasse', 'idClasse');
    }
}