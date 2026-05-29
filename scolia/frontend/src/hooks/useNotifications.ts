import { useEffect, useRef, useState, useCallback } from 'react';
import {
  pollingNotifications,
  marquerLue,
  marquerToutesLues,
  supprimerNotification,
  supprimerLues,
  type Notification,
} from '../service/notification_service';
import { getUser } from '../service/auth';

const POLLING_INTERVAL = 30000; // 30 secondes

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues]             = useState(0);
  const [loading, setLoading]             = useState(false);
  const timestampRef                      = useRef<string | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const user = getUser();

  // Rôles autorisés
  const peutVoir = ['root', 'admin', 'directeur'].includes(user?.role ?? '');

  const poll = useCallback(async () => {
    if (!peutVoir) return;
    try {
      const data = await pollingNotifications(timestampRef.current);
      if (data.nb > 0) {
        setNotifications(prev => {
          const ids = new Set(prev.map(n => n.id));
          const nouvelles = data.nouvelles.filter(n => !ids.has(n.id));
          return [...nouvelles, ...prev].slice(0, 50);
        });
        setNonLues(prev => prev + data.nb);

        // Notification navigateur si autorisée
        if (Notification.permission === 'granted') {
          data.nouvelles.forEach(n => {
            new Notification(n.titre, {
              body: n.message,
              icon: '/favicon.ico',
            });
          });
        }
      }
      timestampRef.current = data.timestamp;
    } catch {
      // Silencieux — pas d'erreur visible à l'utilisateur
    }
  }, [peutVoir]);

  // Chargement initial
  const chargerToutes = useCallback(async () => {
    if (!peutVoir) return;
    try {
      setLoading(true);
      const { getNotifications } = await import('../service/notification_service');
      const data = await getNotifications();
      setNotifications(data.notifications);
      setNonLues(data.nonLues);
      // Définir le timestamp du plus récent
      if (data.notifications.length > 0) {
        timestampRef.current = data.notifications[0].created_at;
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [peutVoir]);

  useEffect(() => {
    if (!peutVoir) return;

    // Demander permission navigateur
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    chargerToutes();

    // Démarrer le polling
    intervalRef.current = setInterval(poll, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [peutVoir, poll, chargerToutes]);

  async function lire(id: number) {
    await marquerLue(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, lue: true } : n)
    );
    setNonLues(prev => Math.max(0, prev - 1));
  }

  async function lireTout() {
    await marquerToutesLues();
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    setNonLues(0);
  }

  async function supprimer(id: number) {
    await supprimerNotification(id);
    const notif = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notif && !notif.lue) setNonLues(prev => Math.max(0, prev - 1));
  }

  async function supprimerToutesLues() {
    await supprimerLues();
    setNotifications(prev => prev.filter(n => !n.lue));
  }

  return {
    notifications,
    nonLues,
    loading,
    lire,
    lireTout,
    supprimer,
    supprimerToutesLues,
    rafraichir: chargerToutes,
  };
}