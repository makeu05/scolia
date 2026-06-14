<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PaiementTranche extends Model
{
    protected $table      = 'paiement_tranches';
    protected $primaryKey = 'idPaieTranche';

    protected $fillable = [
        'matricule', 'idAca', 'idTranche', 'idScolarite', 'ordre',
        'statut', 'montant_du', 'montant_paye', 'date_echeance',
        'idPaie', 'date_paiement', 'idPers',
        'alerte_envoyee', 'alerte_envoyee_at',
    ];

    protected $casts = [
        'date_echeance'    => 'date',
        'date_paiement'    => 'date',
        'alerte_envoyee'   => 'boolean',
        'alerte_envoyee_at'=> 'datetime',
    ];

    public function tranche()
    {
        return $this->belongsTo(Tranches::class, 'idTranche', 'idTranche');
    }

    public function paiement()
    {
        return $this->belongsTo(Paiement::class, 'idPaie', 'idPaie');
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }

    public function encaisseur()
    {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }

    // Vrai si la tranche est en retard
    public function getEnRetardAttribute(): bool
    {
        return $this->statut !== 'payee' && $this->date_echeance->isPast();
    }

    // Reste à payer sur cette tranche
    public function getResteAttribute(): float
    {
        return max(0, $this->montant_du - $this->montant_paye);
    }
}