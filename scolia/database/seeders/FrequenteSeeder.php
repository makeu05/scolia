<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FrequenteSeeder extends Seeder
{
    public function run(): void
    {
        // Élèves 6ème A → Salle 6A (idSalle=1), Année 2024-2025 (idAnnee=2)
        $sixieme = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008];
        // Élèves 3ème A → Salle 3A (idSalle=7), Année 2024-2025 (idAnnee=2)
        $troisieme = [2001, 2002, 2003, 2004, 2005];
        // Élèves Terminale C → Salle TC (idSalle=14), Année 2024-2025 (idAnnee=2)
        $terminale = [3001, 3002, 3003, 3004, 3005];

        $id = 1;

        foreach ($sixieme as $matricule) {
            DB::table('Frequente')->insert([
                'idFrequente' => $id++,
                'idSalle'     => 1,
                'idAcademi'   => 2,
                'matricule'   => $matricule,
                'commentaire' => 'RAS',
                'idAdmin'     => 1,
                'created_at'  => now(),
            ]);
        }

        foreach ($troisieme as $matricule) {
            DB::table('Frequente')->insert([
                'idFrequente' => $id++,
                'idSalle'     => 7,
                'idAcademi'   => 2,
                'matricule'   => $matricule,
                'commentaire' => 'RAS',
                'idAdmin'     => 1,
                'created_at'  => now(),
            ]);
        }

        foreach ($terminale as $matricule) {
            DB::table('Frequente')->insert([
                'idFrequente' => $id++,
                'idSalle'     => 14,
                'idAcademi'   => 2,
                'matricule'   => $matricule,
                'commentaire' => 'RAS',
                'idAdmin'     => 1,
                'created_at'  => now(),
            ]);
        }
    }
}