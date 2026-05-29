<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Livres extends Model {
    protected $table      = 'Livres';
    protected $primaryKey = 'idLivre';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = [
        'idLivre','titre','auteurs','prix','idSpecialite',
        'edition','annee_parution','idAdmin',
    ];
    protected $casts = ['annee_parution' => 'date', 'prix' => 'float'];

    public function specialite() { return $this->belongsTo(Specialite::class, 'idSpecialite', 'idSpecialite'); }
}