<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PersonneSeeder extends Seeder
{
    public function run(): void
    {
        $personnes = [
            // Enseignants (typePersonne=1)
            [1, 'Nguema',   'Paul',    '1985-03-12', 'Yaoundé',  '677100001', 'paul.nguema',   1],
            [2, 'Biya',     'Marie',   '1979-07-22', 'Douala',   '699100002', 'marie.biya',    1],
            [3, 'Atangana', 'Jean',    '1982-11-05', 'Bafoussam','677100003', 'jean.atangana', 1],
            [4, 'Mvondo',   'Claire',  '1990-02-18', 'Yaoundé',  '699100004', 'claire.mvondo', 1],
            [5, 'Mbarga',   'Pierre',  '1975-09-30', 'Kribi',    '677100005', 'pierre.mbarga', 1],
            // Parents (typePersonne=4)
            [6, 'Fono',     'Albert',  '1970-01-15', 'Yaoundé',  '699200001', 'albert.fono',   4],
            [7, 'Nkomo',    'Jeanne',  '1972-06-08', 'Douala',   '677200002', 'jeanne.nkomo',  4],
            [8, 'Abena',    'Samuel',  '1968-04-20', 'Bamenda',  '699200003', 'samuel.abena',  4],
        ];

        foreach ($personnes as [$id, $nom, $prenom, $date, $lieu, $mobile, $username, $type]) {
            DB::table('Personne')->insert([
                'idPers'        => $id,
                'nom'           => $nom,
                'prenom'        => $prenom,
                'dateNaissance' => $date,
                'lieuNaissance' => $lieu,
                'mobile'        => $mobile,
                'phone'         => '000',
                'typePersonne'  => $type,
                'username'      => $username,
                'password'      => Hash::make('scolia1234'),
                'alanyaID'      => null,
                'idAdmin'       => 1,
                'created_at'    => now(),
            ]);
        }
    }
}