<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Crée une notification pour tous les admins
     */
    public static function notifier(
        string $type,
        string $titre,
        string $message,
        string $icone   = '🔔',
        string $couleur = 'blue',
        string $lien    = null,
        int    $idAdmin = null
    ): void {
        // Si idAdmin fourni → notifier cet admin spécifiquement
        // Sinon → notifier tous les admins actifs
        if ($idAdmin) {
            self::creer($type, $titre, $message, $icone, $couleur, $lien, $idAdmin);
            return;
        }

        $admins = DB::table('Admin')
            ->where('actif', 1)
            ->whereIn('typeAdmin', [0, 1, 3]) // root, admin, directeur
            ->pluck('ID');

        foreach ($admins as $id) {
            self::creer($type, $titre, $message, $icone, $couleur, $lien, $id);
        }
    }

    private static function creer(
        string $type,
        string $titre,
        string $message,
        string $icone,
        string $couleur,
        ?string $lien,
        int $idAdmin
    ): void {
        // Éviter les doublons récents (même type + même message dans les 5 dernières minutes)
        $existe = Notification::where('type', $type)
            ->where('idAdmin', $idAdmin)
            ->where('message', $message)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if (!$existe) {
            Notification::create([
                'type'    => $type,
                'titre'   => $titre,
                'message' => $message,
                'icone'   => $icone,
                'couleur' => $couleur,
                'lien'    => $lien,
                'lue'     => false,
                'idAdmin' => $idAdmin,
            ]);
        }
    }

    // ── Helpers par type ──────────────────────────────────────

    public static function paiement(string $message, string $lien = null): void
    {
        self::notifier('paiement', 'Nouveau paiement', $message, '💰', 'green', $lien);
    }

    public static function inscription(string $message, string $lien = null): void
    {
        self::notifier('inscription', 'Nouvelle inscription', $message, '📚', 'blue', $lien);
    }

    public static function debiteur(string $message, string $lien = null): void
    {
        self::notifier('debiteur', 'Élève débiteur', $message, '⚠️', 'red', $lien);
    }

    public static function note(string $message, string $lien = null): void
    {
        self::notifier('note', 'Notes saisies', $message, '📝', 'yellow', $lien);
    }

    public static function eleve(string $message, string $lien = null): void
    {
        self::notifier('eleve', 'Nouvel élève', $message, '👤', 'blue', $lien);
    }
}