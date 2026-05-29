<?php

namespace App\Http\Controllers;

use App\Models\Notification as NotificationModel;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Récupérer toutes les notifications
    public function index(Request $request)
    {
        $idAdmin = $request->user()->getKey();

        $notifications = NotificationModel::where('idAdmin', $idAdmin)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $nonLues = $notifications->where('lue', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'nonLues'       => $nonLues,
        ]);
    }

    // Marquer une notification comme lue
    public function marquerLue($id)
    {
        $notif = NotificationModel::findOrFail($id);
        $notif->update(['lue' => true]);
        return response()->json(['message' => 'Marquée comme lue']);
    }

    // Marquer toutes comme lues
    public function marquerToutesLues(Request $request)
    {
        $idAdmin = $request->user()->getKey();

        NotificationModel::where('idAdmin', $idAdmin)
            ->where('lue', false)
            ->update(['lue' => true]);

        return response()->json(['message' => 'Toutes marquées comme lues']);
    }

    // Supprimer une notification
    public function destroy($id)
    {
        NotificationModel::findOrFail($id)->delete();
        return response()->json(['message' => 'Notification supprimée']);
    }

    // Supprimer toutes les lues
    public function supprimerLues(Request $request)
    {
        $idAdmin = $request->user()->getKey();

        NotificationModel::where('idAdmin', $idAdmin)
            ->where('lue', true)
            ->delete();

        return response()->json(['message' => 'Notifications lues supprimées']);
    }

    // Polling — seulement les nouvelles depuis un timestamp
    public function polling(Request $request)
    {
        $idAdmin = $request->user()->getKey();
        $depuis  = $request->query('depuis');

        $query = NotificationModel::where('idAdmin', $idAdmin)
            ->where('lue', false);

        if ($depuis) {
            $query->where('created_at', '>', $depuis);
        }

        $nouvelles = $query->orderByDesc('created_at')->get();

        return response()->json([
            'nouvelles' => $nouvelles,
            'nb'        => $nouvelles->count(),
            'timestamp' => now()->toISOString(),
        ]);
    }
}