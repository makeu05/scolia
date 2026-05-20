<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CycleSeeder extends Seeder
{
    public function run(): void
    {
        $cycles = [
            [1, 'Maternelle',  'Cycle maternel, enfants de 3 à 5 ans'],
            [2, 'Primaire',    'Cycle primaire, du CP au CM2'],
            [3, 'Collège',     'Cycle secondaire premier degré, de la 6ème en 3ème'],
            [4, 'Lycée',       'Cycle secondaire second degré, de la 2nde en Terminale'],
            [5, 'Professionnel','Cycle d\'enseignement technique et professionnel'],
        ];

        foreach ($cycles as [$id, $libelle, $description]) {
            DB::table('Cycle')->insert([
                'idCycle'     => $id,
                'libelle'     => $libelle,
                'description' => $description,
                'idAdmin'     => 1,
                'created'     => now(),
            ]);
        }
    }
}