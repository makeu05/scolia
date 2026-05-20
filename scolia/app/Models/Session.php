<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model {
    protected $table = 'Session';
    protected $primaryKey = 'idSession';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idSession', 'libelle', 'description', 'idTrimestre', 'idPers',
    ];
 
    public function trimestre() {
        return $this->belongsTo(Trimestre::class, 'idTrimestre', 'idTrimes');
    }
 
    public function evaluations() {
        return $this->hasMany(Evaluation::class, 'idSession', 'idSession');
    }
}
