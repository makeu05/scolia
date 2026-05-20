<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoursSeeder extends Seeder
{
    public function run(): void
    {
        // Cours pour 6ème A (idClasse=6)
        $cours = [
            [1,  'Mathématiques',          2,   '6ème', 6],
            [2,  'Français',               2,   '6ème', 6],
            [3,  'Sciences de la Vie',     1.5, '6ème', 6],
            [4,  'Histoire-Géographie',    1.5, '6ème', 6],
            [5,  'Anglais',                1.5, '6ème', 6],
            [6,  'Éducation Physique',     1,   '6ème', 6],
            // Cours pour 3ème A (idClasse=12)
            [7,  'Mathématiques',          3,   '3ème', 12],
            [8,  'Physique-Chimie',        2,   '3ème', 12],
            [9,  'Français',               2,   '3ème', 12],
            [10, 'Anglais',                2,   '3ème', 12],
            [11, 'Histoire-Géographie',    2,   '3ème', 12],
            [12, 'SVT',                    1.5, '3ème', 12],
            [13, 'Éducation Civique',      1,   '3ème', 12],
            // Cours pour Terminale C (idClasse=19)
            [14, 'Mathématiques',          5,   'TleC', 19],
            [15, 'Physique',               4,   'TleC', 19],
            [16, 'Chimie',                 3,   'TleC', 19],
            [17, 'SVT',                    3,   'TleC', 19],
            [18, 'Français',               2,   'TleC', 19],
            [19, 'Anglais',                2,   'TleC', 19],
            [20, 'Philosophie',            2,   'TleC', 19],
        ];

        foreach ($cours as [$id, $libelle, $coeff, $desc, $idClasse]) {
            DB::table('Cours')->insert([
                'idCours'     => $id,
                'libelle'     => $libelle,
                'note'        => 0,
                'coefficient' => $coeff,
                'description' => $desc,
                'idClasse'    => $idClasse,
                'actif'       => 1,
                'idAdmin'     => 1,
                'created_at'  => now(),
            ]);
        }
    }
}