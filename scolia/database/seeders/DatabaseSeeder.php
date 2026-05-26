<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            VilleNaissanceSeeder::class,
            CycleSeeder::class,
            ClasseSeeder::class,
            AnneeAcademiqueSeeder::class,
            TrimestreSeeder::class,
            SessionSeeder::class,
            SalleSeeder::class,
            NatureEpreuveSeeder::class,
            PersonneSeeder::class,
            CoursSeeder::class,
            EnseignantSeeder::class,
            EleveSeeder::class,
            FrequenteSeeder::class,
            EpreuveSeeder::class,
            ModeSeeder::class,
        ]);
    }
}