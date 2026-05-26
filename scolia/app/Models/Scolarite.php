<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Scolarite
class Scolarite extends Model {
    protected $table = 'Scolarite';
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = 'idScolarite';
    protected $fillable = [
        'idScolarite', 'inscription', 'pension',
        'nbreTranche', 'description', 'idCycle', 'idFondateur'
    ];
    public function cycle() {
        return $this->belongsTo(Cycle::class, 'idCycle', 'idCycle');
    }
    public function tranches() {
        return $this->hasMany(Tranches::class, 'idScolarite', 'idScolarite');
    }
}



// Paiement
