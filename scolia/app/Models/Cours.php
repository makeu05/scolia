<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class Cours extends Model {
    protected $table = 'Cours';
    protected $primaryKey = 'idCours';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idCours', 'libelle', 'note', 'coefficient',
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