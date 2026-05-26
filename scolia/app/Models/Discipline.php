<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discipline extends Model
{
    protected $table      = 'Discipline';
    protected $primaryKey = 'ID';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = ['ID','libelle','points'];
}
