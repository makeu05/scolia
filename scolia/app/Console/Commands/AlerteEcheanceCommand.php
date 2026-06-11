<?php
// app/Console/Commands/AlerteEcheanceCommand.php
// php artisan make:command AlerteEcheance

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PaiementTranche;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AlerteEcheanceCommand extends Command
{
    protected $signature   = 'paiements:alertes';
    protected $description = 'Envoie des alertes pour les tranches dues ou en retard';

    public function handle(): void
    {
        $today    = Carbon::today();
        $dans7j   = Carbon::today()->addDays(7);

        // ── 1. Marquer en retard les tranches dépassées ───────────────────────
        $mises_en_retard = PaiementTranche::where('statut', '!=', 'payee')
            ->where('date_echeance', '<', $today)
            ->update(['statut' => 'en_retard']);

        $this->info("$mises_en_retard tranche(s) marquée(s) en retard.");

        // ── 2. Alertes J-7 (prévention) ───────────────────────────────────────
        $bientotDues = PaiementTranche::with(['eleve', 'tranche'])
            ->where('statut', 'en_attente')
            ->whereDate('date_echeance', '<=', $dans7j)
            ->whereDate('date_echeance', '>=', $today)
            ->where('alerte_envoyee', false)
            ->get();

        foreach ($bientotDues as $t) {
            $joursRestants = $today->diffInDays($t->date_echeance);
            $eleve         = $t->eleve;

            // Notifier les admins
            $admins = DB::table('users')
                ->whereIn('role', ['admin', 'directeur', 'fondateur'])
                ->pluck('idPers');

            foreach ($admins as $idPers) {
                Notification::create([
                    'idPers'  => $idPers,
                    'titre'   => "Échéance dans {$joursRestants}j — {$eleve->prenom} {$eleve->nom}",
                    'message' => "La {$t->tranche->libelle} de " . number_format($t->montant_du, 0, ',', ' ') . " FCFA est due le " . $t->date_echeance->format('d/m/Y'),
                    'type'    => 'echeance',
                    'lu'      => false,
                ]);
            }

            $t->update(['alerte_envoyee' => true, 'alerte_envoyee_at' => now()]);
        }

        $this->info("{$bientotDues->count()} alerte(s) J-7 envoyée(s).");

        // ── 3. Alertes retard (non encore alertées) ───────────────────────────
        $enRetardNonAlertes = PaiementTranche::with(['eleve', 'tranche'])
            ->where('statut', 'en_retard')
            ->where('alerte_envoyee', false)
            ->get();

        foreach ($enRetardNonAlertes as $t) {
            $joursRetard = $t->date_echeance->diffInDays($today);
            $eleve       = $t->eleve;

            $admins = DB::table('users')
                ->whereIn('role', ['admin', 'directeur', 'fondateur'])
                ->pluck('idPers');

            foreach ($admins as $idPers) {
                Notification::create([
                    'idPers'  => $idPers,
                    'titre'   => "⚠ Retard {$joursRetard}j — {$eleve->prenom} {$eleve->nom}",
                    'message' => "La {$t->tranche->libelle} de " . number_format($t->montant_du - $t->montant_paye, 0, ',', ' ') . " FCFA n'a pas été payée (échéance : " . $t->date_echeance->format('d/m/Y') . ")",
                    'type'    => 'retard_paiement',
                    'lu'      => false,
                ]);
            }

            $t->update(['alerte_envoyee' => true, 'alerte_envoyee_at' => now()]);
        }

        $this->info("{$enRetardNonAlertes->count()} alerte(s) retard envoyée(s).");
    }
}

// ── Enregistrer dans app/Console/Kernel.php ──────────────────────────────────
// protected function schedule(Schedule $schedule): void
// {
//     $schedule->command('paiements:alertes')->dailyAt('08:00');
// }