import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { getCouleurClasse, getTempsEcoule } from '../../service/notification_service';

export default function NotificationBell() {
  const navigate    = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef     = useRef<HTMLDivElement>(null);

  const {
    notifications,
    nonLues,
    loading,
    lire,
    lireTout,
    supprimer,
    supprimerToutesLues,
    rafraichir,
  } = useNotifications();

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleClick(notif: any) {
    if (!notif.lue) await lire(notif.id);
    if (notif.lien) {
      navigate(notif.lien);
      setOpen(false);
    }
  }

  const couleurPoint: Record<string, string> = {
    blue:   'bg-blue-500',
    green:  'bg-green-500',
    red:    'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="relative" ref={dropRef}>

      {/* ── Cloche ── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                Notifications
              </h3>
              {nonLues > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {nonLues} non lue{nonLues > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={rafraichir}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                title="Rafraîchir"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {nonLues > 0 && (
                <button
                  onClick={lireTout}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                  title="Tout marquer comme lu"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              {notifications.some(n => n.lue) && (
                <button
                  onClick={supprimerToutesLues}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
                  title="Supprimer les lues"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#1a3a5c] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 transition cursor-pointer ${
                    !notif.lue
                      ? 'bg-blue-50/40 hover:bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  {/* Icône + point coloré */}
                  <div className="relative flex-shrink-0">
                    <span className="text-xl">{notif.icone}</span>
                    {!notif.lue && (
                      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                        couleurPoint[notif.couleur] ?? 'bg-blue-500'
                      }`} />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${
                        !notif.lue ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      }`}>
                        {notif.titre}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); supprimer(notif.id); }}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition mt-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {getTempsEcoule(notif.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button
                onClick={() => { navigate('/notifications'); setOpen(false); }}
                className="text-xs text-[#1a3a5c] font-medium hover:underline"
              >
                Voir toutes les notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}