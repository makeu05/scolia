<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NatureEpreuveSeeder extends Seeder
{
    public function run(): void
    {
        $natures = [
            [1, 'Devoir sur table',    'Devoir écrit en classe, durée 1h à 2h'],
            [2, 'Interrogation',       'Interrogation surprise ou programmée'],
            [3, 'Examen',              'Examen de fin de trimestre ou de semestre'],
            [4, 'Travaux pratiques',   'Évaluation pratique en laboratoire'],
            [5, 'Exposé oral',         'Présentation orale devant la classe'],
            [6, 'Projet',              'Travail de recherche ou projet de groupe'],
            [7, 'Devoir maison',       'Travail à faire à la maison'],
        ];

        foreach ($natures as [$id, $libelle, $description]) {
            DB::table('NatureEpreuve')->insert([
                'idNature'    => $id,
                'libelle'     => $libelle,
                'description' => $description,
            ]);
        }
    }
}