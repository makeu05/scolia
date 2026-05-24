<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Personne;

class PersonneController extends Controller
{
    // PersonneController
public function index(Request $request)
{
    $query = Personne::query();

    if ($request->filled('typePersonne')) {
        $query->where('typePersonne', $request->typePersonne);
    }

    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('nom',    'like', "%$search%")
              ->orWhere('prenom', 'like', "%$search%")
              ->orWhere('mobile', 'like', "%$search%");
        });
    }

    return response()->json($query->limit(10)->get());
}
}
