<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            // Primaire (idCycle=2)
            [1, 'CP',     2],
            [2, 'CE1',    2],
            [3, 'CE2',    2],
            [4, 'CM1',    2],
            [5, 'CM2',    2],
            // Collège (idCycle=3)
            [6,  '6ème A', 3],
            [7,  '6ème B', 3],
            [8,  '5ème A', 3],
            [9,  '5ème B', 3],
            [10, '4ème A', 3],
            [11, '4ème B', 3],
            [12, '3ème A', 3],
            [13, '3ème B', 3],
            // Lycée (idCycle=4)
            [14, '2nde A',       4],
            [15, '2nde C',       4],
            [16, '1ère A',       4],
            [17, '1ère C',       4],
            [18, 'Terminale A',  4],
            [19, 'Terminale C',  4],
            [20, 'Terminale D',  4],
        ];

        foreach ($classes as [$id, $libelle, $idCycle]) {
            DB::table('Classe')->insert([
                'idClasse'   => $id,
                'libelle'    => $libelle,
                'idCycle'    => $idCycle,
                'idAdmin'    => 1,
                'created_at' => now(),
            ]);
        }
    }
}