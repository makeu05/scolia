<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnseignantSeeder extends Seeder
{
    public function run(): void
    {
        // Chaque enseignant est lié à un cours
        $enseignants = [
            [1, 1, 1],  // Nguema Paul    → Maths 6ème
            [2, 2, 2],  // Biya Marie     → Français 6ème
            [3, 3, 7],  // Atangana Jean  → Maths 3ème
            [4, 4, 9],  // Mvondo Claire  → Français 3ème
            [5, 5, 14], // Mbarga Pierre  → Maths Tle C
        ];

        foreach ($enseignants as [$idEnseignant, $idPers, $idCours]) {
            DB::table('Enseignant')->insert([
                'idEnseignant' => $idEnseignant,
                'idPers'       => $idPers,
                'idCours'      => $idCours,
                'Actif'        => 1,
                'idAdmin'      => 1,
                'created_at'   => now(),
            ]);
        }
    }
}