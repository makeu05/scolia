<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Messages extends Model {
    protected $table      = 'Messages';
    protected $primaryKey = 'idMessages';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = [
        'idMessages','idExp_Pers','idParent','objet',
        'information','type_message','AnneeAcade','valider',
    ];
    protected $casts = ['created_at' => 'datetime', 'valider' => 'boolean'];

    public function expediteur() { return $this->belongsTo(Personne::class, 'idExp_Pers', 'idPers'); }
    public function parent()     { return $this->belongsTo(Parents::class,  'idParent',   'idParent'); }
}