<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalleSeeder extends Seeder
{
    public function run(): void
    {
        $salles = [
            [1,  'Salle 6A',  'Bâtiment A',  '50m²', 6],
            [2,  'Salle 6B',  'Bâtiment A',  '50m²', 7],
            [3,  'Salle 5A',  'Bâtiment A',  '50m²', 8],
            [4,  'Salle 5B',  'Bâtiment A',  '50m²', 9],
            [5,  'Salle 4A',  'Bâtiment B',  '55m²', 10],
            [6,  'Salle 4B',  'Bâtiment B',  '55m²', 11],
            [7,  'Salle 3A',  'Bâtiment B',  '55m²', 12],
            [8,  'Salle 3B',  'Bâtiment B',  '55m²', 13],
            [9,  'Salle 2A',  'Bâtiment C',  '60m²', 14],
            [10, 'Salle 2C',  'Bâtiment C',  '60m²', 15],
            [11, 'Salle 1A',  'Bâtiment C',  '60m²', 16],
            [12, 'Salle 1C',  'Bâtiment C',  '60m²', 17],
            [13, 'Salle TA',  'Bâtiment D',  '65m²', 18],
            [14, 'Salle TC',  'Bâtiment D',  '65m²', 19],
            [15, 'Salle TD',  'Bâtiment D',  '65m²', 20],
        ];

        foreach ($salles as [$id, $libelle, $position, $surface, $idClasse]) {
            DB::table('Salle')->insert([
                'idSalle'    => $id,
                'libelle'    => $libelle,
                'position'   => $position,
                'surface'    => $surface,
                'idClasse'   => $idClasse,
                'actif'      => 1,
                'idAdmin'    => 1,
                'created_at' => now(),
            ]);
        }
    }
}