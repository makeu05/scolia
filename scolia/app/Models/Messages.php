<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    protected $table      = 'messages';
    protected $primaryKey = 'idMessages';
    public $incrementing  = false;
    public $timestamps    = false;

    const TYPE_INDIVIDUEL      = 0;
    const TYPE_TOUS_PARENTS    = 1;
    const TYPE_RAPPEL_PAIEMENT = 2;

    protected $fillable = [
        'idMessages', 'idExp_Pers', 'idParent',
        'objet', 'information', 'type_message',
        'AnneeAcade', 'valider',
    ];

    protected $casts = ['valider' => 'boolean', 'type_message' => 'integer'];

    public function expediteur()
    {
        return $this->belongsTo(Personne::class, 'idExp_Pers', 'idPers');
    }

    public function parent()
    {
        return $this->belongsTo(Parents::class, 'idParent', 'idParent');
    }
}
