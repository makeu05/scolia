<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scolarite extends Model {
    protected $table = 'Scolarite';
    protected $primaryKey = 'idScolarite';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'idScolarite', 'inscription', 'pension', 'nbreTranche',
        'description', 'idCycle', 'idFondateur',
    ];

    public function cycle() {
        return $this->belongsTo(Cycle::class, 'idCycle', 'idCycle');
    }

    public function tranches() {
        return $this->hasMany(Tranches::class, 'idScolarite', 'idScolarite');
    }
}