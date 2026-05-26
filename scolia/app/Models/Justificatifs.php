<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Justificatifs extends Model
{
    protected $table      = 'justificatifs';
    protected $primaryKey = 'ID';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = ['ID', 'idRapport', 'commentaire', 'idDirecteur', 'urlDoc'];

    public function rapport()
    {
        return $this->belongsTo(Rapport::class, 'idRapport', 'idRap');
    }
}
