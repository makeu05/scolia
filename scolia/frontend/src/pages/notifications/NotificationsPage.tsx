import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { getCouleurClasse, getTempsEcoule } from '../../service/notification_service';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    nonLues,
    loading,
    lire,
    lireTout,
    supprimer,
    supprimerToutesLues,
  } = useNotifications();

  const [filtre, setFiltre] = useState<'tout' | 'nonLues' | 'lues'>('tout');

  const filtrees = notifications.filter(n => {
    if (filtre === 'nonLues') return !n.lue;
    if (filtre === 'lues')    return n.lue;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {nonLues} non lue{nonLues > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {nonLues > 0 && (
            <button
              onClick={lireTout}
              className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-lg text-sm hover:bg-muted/30 transition"
            >
              <Check className="h-4 w-4" />
              Tout lire
            </button>
          )}
          {notifications.some(n => n.lue) && (
            <button
              onClick={supprimerToutesLues}
              className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/20 transition"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer les lues
            </button>
          )}
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'tout',    label: 'Toutes',   count: notifications.length },
          { key: 'nonLues', label: 'Non lues', count: nonLues },
          { key: 'lues',    label: 'Lues',     count: notifications.filter(n => n.lue).length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filtre === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:bg-muted/30'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filtre === f.key
                ? 'bg-white/20'
                : 'bg-muted text-muted-foreground'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrees.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrees.map(notif => (
            <div
              key={notif.id}
              className={`flex gap-4 p-4 rounded-2xl border transition cursor-pointer ${
                !notif.lue
                  ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-50 dark:bg-blue-500/5 dark:border-blue-500/20'
                  : 'bg-card border-border hover:bg-muted/20'
              }`}
              onClick={async () => {
                if (!notif.lue) await lire(notif.id);
                if (notif.lien) navigate(notif.lien);
              }}
            >
              {/* Icône */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                {notif.icone}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!notif.lue ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                    {notif.titre}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.lue && (
                      <button
                        onClick={e => { e.stopPropagation(); lire(notif.id); }}
                        className="p-1 rounded hover:bg-muted transition text-muted-foreground"
                        title="Marquer comme lu"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); supprimer(notif.id); }}
                      className="p-1 rounded hover:bg-red-100 transition text-muted-foreground hover:text-red-400"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  {getTempsEcoule(notif.created_at)}
                </p>
              </div>

              {/* Point non lue */}
              {!notif.lue && (
                <div className="flex-shrink-0 mt-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';