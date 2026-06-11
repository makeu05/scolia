<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Messages extends Model {
    protected $table      = 'messages'; // ✅ minuscule — MySQL Windows est case-sensitive
    protected $primaryKey = 'idMessages';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = [
        'idMessages', 'idExp_Pers', 'idParent', 'objet',
        'information', 'type_message', 'AnneeAcade', 'valider',
        // ✅ Nouveaux champs chat
        'direction', 'lu', 'lu_at', 'idDest_Pers',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'lu_at'      => 'datetime',
        'valider'    => 'boolean',
        'lu'         => 'boolean',
    ];

    public function expediteur() {
        return $this->belongsTo(Personne::class, 'idExp_Pers', 'idPers');
    }

    public function parent() {
        return $this->belongsTo(Parents::class, 'idParent', 'idParent');
    }
}