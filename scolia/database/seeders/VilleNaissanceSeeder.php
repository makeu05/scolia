<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VilleNaissanceSeeder extends Seeder
{
    public function run(): void
    {
        $fichier = database_path('seeders/cameroun_villes.txt');
        $lignes  = file($fichier, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $villes = [];
        $id = 1;

        foreach ($lignes as $ligne) {
            $cols = explode("\t", $ligne);

            // Structure : geonameid, name, asciiname, alternatenames, lat, lng, ...
            if (count($cols) < 2) continue;

            $villes[] = [
                'idVille' => $id++,
                'libelle' => $cols[1], // colonne "name"
                'actif'   => 1,
            ];
        }

        // Insertion par batch de 100
        foreach (array_chunk($villes, 100) as $batch) {
            DB::table('VilleNaissance')->insertOrIgnore($batch);
        }

        $this->command->info(count($villes) . ' villes insérées.');
    }
}