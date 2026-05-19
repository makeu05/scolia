<?php
// ═══════════════════════════════════════════════════════════════
// app/Models/Paiement.php
// ═══════════════════════════════════════════════════════════════

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Paiement
 *
 * Sécurité DevSec :
 * - $fillable strict (pas de $guarded = [])
 * - SoftDeletes : un paiement n'est JAMAIS supprimé physiquement
 * - Montants en centimes pour éviter les erreurs d'arrondi float
 * - Accesseurs qui convertissent les centimes en FCFA à l'affichage
 */
class Paiement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'paiements';

    // ── Whitelist stricte des champs assignables en masse ──────────────────
    protected $fillable = [
        'scolarite_id',
        'mode_paiement_id',
        'enregistre_par',
        'montant',          // En centimes
        'date_paiement',
        'reference',
        'numero_recu',
        'notes',
    ];

    // ── Jamais exposés dans les réponses JSON ──────────────────────────────
    protected $hidden = [
        'deleted_at',
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'montant'       => 'integer',
        'created_at'    => 'datetime',
    ];

    // ── Accesseur : montant en FCFA pour l'affichage ───────────────────────
    public function getMontantFcfaAttribute(): float
    {
        return $this->montant / 100;
    }

    // ── Relations ──────────────────────────────────────────────────────────
    public function scolarite(): BelongsTo
    {
        return $this->belongsTo(Scolarite::class);
    }

    public function modePaiement(): BelongsTo
    {
        return $this->belongsTo(ModePaiement::class, 'mode_paiement_id');
    }

    public function enregistrePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enregistre_par');
    }

    // ── Scope : paiements d'une période ────────────────────────────────────
    public function scopeEntreDates($query, string $debut, string $fin)
    {
        return $query->whereBetween('date_paiement', [$debut, $fin]);
    }
}



