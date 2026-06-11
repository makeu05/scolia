<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class EmploiDuTemps extends Model
{
    protected $table      = 'emploidutemps';
    protected $primaryKey = 'idTemps';
    public    $timestamps = false;
    public    $incrementing = true;
 
    protected $fillable = [
        'jour', 'heure', 'heureFin', 'idClasse', 'idCours',
        'idSalle', 'idAdmin', 'type', 'libelle', 'description',
    ];
 
    public function cours()
    {
        return $this->belongsTo(Cours::class, 'idCours', 'idCours');
    }
 
    public function salle()
    {
        return $this->belongsTo(Salle::class, 'idSalle', 'idSalle');
    }
 
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'idClasse', 'idClasse');
    }
}