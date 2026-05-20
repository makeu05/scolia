<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrimestreSeeder extends Seeder
{
    public function run(): void
    {
        $trimestres = [
            // Année 2024-2025
            [1, '1er Trimestre', 'Septembre - Décembre 2024', 2],
            [2, '2ème Trimestre','Janvier - Mars 2025',        2],
            [3, '3ème Trimestre','Avril - Juillet 2025',       2],
        ];

        foreach ($trimestres as [$id, $libelle, $periode, $idAca]) {
            DB::table('Trimestre')->insert([
                'idTrimes' => $id,
                'libelle'  => $libelle,
                'periode'  => $periode,
                'idAca'    => $idAca,
                'idAdmin'  => 1,
            ]);
        }
    }
}