<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnneeAcademiqueSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('AnneeAcademique')->insert([
            [
                'idAnnee'    => 1,
                'libelle'    => 'Année académique 2023-2024',
                'periode'    => 'Septembre 2023 - Juillet 2024',
                'created_at' => now(),
                'idAdmin'    => 1,
            ],
            [
                'idAnnee'    => 2,
                'libelle'    => 'Année académique 2024-2025',
                'periode'    => 'Septembre 2024 - Juillet 2025',
                'created_at' => now(),
                'idAdmin'    => 1,
            ],
        ]);
    }
}