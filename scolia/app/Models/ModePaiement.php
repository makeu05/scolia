<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModePaiement extends Model
{
    protected $table = 'modes_paiement';

    protected $fillable = ['libelle'];

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'mode_paiement_id');
    }
}