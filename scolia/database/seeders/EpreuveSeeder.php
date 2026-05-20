<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EpreuveSeeder extends Seeder
{
    public function run(): void
    {
        $epreuves = [
            [1, 'Devoir 1 — Maths 6ème',    1, 1], // Devoir sur table
            [2, 'Devoir 1 — Français 6ème',  1, 2],
            [3, 'Interro — SVT 6ème',        2, 1], // Interrogation
            [4, 'Devoir 1 — Maths 3ème',     1, 3],
            [5, 'Devoir 1 — Physique 3ème',  1, 3],
            [6, 'Examen T1 — Maths TleC',    3, 5], // Examen
            [7, 'Devoir 1 — Physique TleC',  1, 5],
            [8, 'TP Chimie TleC',            4, 5], // Travaux pratiques
        ];

        foreach ($epreuves as [$id, $libelle, $idNature, $idPers]) {
            DB::table('Epreuve')->insert([
                'idEpreuve'  => $id,
                'libelle'    => $libelle,
                'urlDoc'     => 'INDEFINI',
                'auteur'     => 'INDEFINI',
                'idNature'   => $idNature,
                'idPers'     => $idPers,
                'created_at' => now(),
            ]);
        }
    }
}