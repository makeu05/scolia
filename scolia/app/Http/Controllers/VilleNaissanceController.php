<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VilleNaissance;

class VilleNaissanceController extends Controller
{
    //
    public function index() {
    return response()->json(VilleNaissance::all());
}
}
