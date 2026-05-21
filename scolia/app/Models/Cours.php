<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class Cours extends Model {
    protected $table = 'Cours';
    protected $primaryKey = 'idCours';
    public $incrementing = true;
    public $timestamps = false;
 
    protected $fillable = [
         'libelle', 'note', 'coefficient',
        'description', 'idClasse', 'actif', 'idAdmin',
    ];
 
    public function classe() {
        return $this->belongsTo(Classe::class, 'idClasse', 'idClasse');
    }
 
    public function enseignant() {
        return $this->hasOne(Enseignant::class, 'idCours', 'idCours');
    }
 
    public function evaluations() {
        return $this->hasMany(Evaluation::class, 'idCours', 'idCours');
    }
 
    public function emploiDuTemps() {
        return $this->hasMany(EmploiDuTemps::class, 'idCours', 'idCours');
    }
}
 
?>