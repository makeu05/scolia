<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SessionSeeder extends Seeder
{
    public function run(): void
    {
        $sessions = [
            // Trimestre 1
            [1, 'Session 1 — T1', 'Première session du 1er trimestre', 1],
            [2, 'Session 2 — T1', 'Deuxième session du 1er trimestre', 1],
            // Trimestre 2
            [3, 'Session 1 — T2', 'Première session du 2ème trimestre', 2],
            [4, 'Session 2 — T2', 'Deuxième session du 2ème trimestre', 2],
            // Trimestre 3
            [5, 'Session 1 — T3', 'Première session du 3ème trimestre', 3],
            [6, 'Session 2 — T3', 'Deuxième session du 3ème trimestre', 3],
        ];

        foreach ($sessions as [$id, $libelle, $description, $idTrimestre]) {
            DB::table('Session')->insert([
                'idSession'   => $id,
                'libelle'     => $libelle,
                'description' => $description,
                'idTrimestre' => $idTrimestre,
                'idPers'      => 1,
                'created_at'  => now(),
            ]);
        }
    }
}