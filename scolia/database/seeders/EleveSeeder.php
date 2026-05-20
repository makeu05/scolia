<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EleveSeeder extends Seeder
{
    public function run(): void
    {
        $eleves = [
            // 6ème A
            [1001, 'Fouda',    'Alexis',   '2012-03-15', 'Yaoundé',   1, 1],
            [1002, 'Nkeng',    'Diane',    '2012-07-22', 'Douala',    0, 1],
            [1003, 'Ateba',    'Marc',     '2011-11-08', 'Bafoussam', 1, 2],
            [1004, 'Owona',    'Sandra',   '2012-01-30', 'Yaoundé',   0, 1],
            [1005, 'Mekongo',  'Lionel',   '2012-05-18', 'Kribi',     1, 3],
            [1006, 'Bongo',    'Estelle',  '2011-09-25', 'Yaoundé',   0, 1],
            [1007, 'Ndongo',   'Fabrice',  '2012-04-12', 'Douala',    1, 2],
            [1008, 'Manga',    'Carine',   '2012-06-03', 'Ngaoundéré',0, 4],
            // 3ème A
            [2001, 'Essomba',  'Rodrigue', '2009-02-14', 'Yaoundé',   1, 1],
            [2002, 'Mveng',    'Patricia', '2009-08-19', 'Douala',    0, 2],
            [2003, 'Abomo',    'Eric',     '2008-12-05', 'Bafoussam', 1, 3],
            [2004, 'Ndzana',   'Sylvie',   '2009-03-28', 'Yaoundé',   0, 1],
            [2005, 'Ondo',     'Kevin',    '2009-07-11', 'Bertoua',   1, 5],
            // Terminale C
            [3001, 'Belinga',  'Arnaud',   '2006-01-20', 'Yaoundé',   1, 1],
            [3002, 'Minko',    'Laure',    '2006-05-14', 'Douala',    0, 2],
            [3003, 'Eba',      'Cyrille',  '2006-09-03', 'Bafoussam', 1, 1],
            [3004, 'Abate',    'Nathalie', '2007-02-17', 'Yaoundé',   0, 3],
            [3005, 'Ndjock',   'Boris',    '2006-11-28', 'Ebolowa',   1, 1],
        ];

        foreach ($eleves as [$mat, $nom, $prenom, $date, $lieu, $sexe, $idVille]) {
            DB::table('Eleve')->insert([
                'matricule'        => $mat,
                'nom'              => $nom,
                'prenom'           => $prenom,
                'dateNaissance'    => $date,
                'lieuNaissance'    => $lieu,
                'sexe'             => $sexe,
                'langue'           => 'Français',
                'photoURL'         => 'INDEFINI',
                'actif'            => 1,
                'idVilleNaissance' => $idVille,
                'idAdmin'          => 1,
                'created_at'       => now(),
            ]);
        }
    }
}