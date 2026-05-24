<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'Admin';
    public $timestamps   = false;
    public $incrementing = false;
    protected $primaryKey = 'ID';

    protected $fillable = [
        'ID', 'nom', 'username', 'password',
        'actif', 'typeAdmin', 'mobile', 'alanyaID',
    ];

    protected $hidden = ['password'];
}