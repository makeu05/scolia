<?php

namespace Database\Seeders;

use App\Models\Mode;
use Illuminate\Database\Seeder;

class ModeSeeder extends Seeder
{
    public function run()
    {
        $modes = [
            [
                'idMode'      => 1,
                'libelle'     => 'Espèces',
                'information' => 'Paiement en liquide au secrétariat',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 2,
                'libelle'     => 'Orange Money',
                'information' => 'Paiement via Orange Money',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 3,
                'libelle'     => 'MTN MoMo',
                'information' => 'Paiement via MTN Mobile Money',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 4,
                'libelle'     => 'Virement Bancaire',
                'information' => 'Virement sur le compte bancaire de l\'école',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 5,
                'libelle'     => 'Mobile Money Autre',
                'information' => 'Autres opérateurs de Mobile Money',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 6,
                'libelle'     => 'Chèque',
                'information' => 'Paiement par chèque bancaire',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
            [
                'idMode'      => 7,
                'libelle'     => 'Wave',
                'information' => 'Paiement via Wave',
                'actif'       => 1,
                'idFondateur' => 1,
            ],
        ];

        foreach ($modes as $mode) {
            Mode::updateOrCreate(
                ['idMode' => $mode['idMode']],
                $mode
            );
        }

        $this->command->info('✅ ' . count($modes) . ' modes de paiement ont été ajoutés avec succès !');
    }
}