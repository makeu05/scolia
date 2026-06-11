<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class PauseCycle extends Model
{
    protected $table      = 'pauses_cycle';
    protected $primaryKey = 'idPause';
 
    protected $fillable = [
        'idCycle', 'libelle', 'heureDebut', 'heureFin', 'jours', 'actif', 'idAdmin',
    ];
 
    protected $casts = [
        'jours' => 'array',
        'actif' => 'boolean',
    ];
 
    public function cycle()
    {
        return $this->belongsTo(Cycle::class, 'idCycle', 'idCycle');
    }
}
 