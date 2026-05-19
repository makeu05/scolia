<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scolarite extends Model
{
    protected $table = 'scolarites';

    protected $fillable = [
        'eleve_id',
        'annee_academique_id',
        'montant_total',
        'montant_paye',
        'statut',
        'date_limite',
    ];

    protected $casts = [
        'montant_total' => 'integer',
        'montant_paye'  => 'integer',
        'date_limite'   => 'date',
    ];

    public function getMontantTotalFcfaAttribute(): float
    {
        return $this->montant_total / 100;
    }

    public function getSoldeRestantFcfaAttribute(): float
    {
        return ($this->montant_total - $this->montant_paye) / 100;
    }

    public function getPourcentagePaiementAttribute(): float
    {
        if ($this->montant_total === 0) return 100.0;
        return round(($this->montant_paye / $this->montant_total) * 100, 1);
    }

    public function recalculer(): void
    {
        $totalPaye = $this->paiements()->sum('montant');
        $this->montant_paye = $totalPaye;
        $this->statut = $totalPaye >= $this->montant_total ? 'en_regle' : 'en_retard';
        $this->save();
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function anneeAcademique(): BelongsTo
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function scopeEnRetard($query)
    {
        return $query->where('statut', 'en_retard');
    }

    public function scopeEnRegle($query)
    {
        return $query->where('statut', 'en_regle');
    }
}