import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  online_at: string;
}

const COLORS = [
  'hsl(0, 75%, 60%)',
  'hsl(30, 90%, 55%)',
  'hsl(50, 90%, 50%)',
  'hsl(140, 60%, 45%)',
  'hsl(190, 75%, 50%)',
  'hsl(220, 75%, 60%)',
  'hsl(270, 65%, 60%)',
  'hsl(320, 70%, 60%)',
];

const ANIMALS = ['🦊', '🐼', '🐨', '🐰', '🐯', '🐸', '🦄', '🐙', '🦁', '🐵', '🐮', '🐷'];

const getOrCreateIdentity = (): { userId: string; name: string; color: string } => {
  const KEY = 'collab_identity_v1';
  const stored = localStorage.getItem(KEY);
  if (stored) return JSON.parse(stored);
  const userId = crypto.randomUUID();
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 1000);
  const identity = {
    userId,
    name: `${animal} 旅人${num}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  localStorage.setItem(KEY, JSON.stringify(identity));
  return identity;
};

export const getMyIdentity = getOrCreateIdentity;

export function usePresence(tripId: string | null) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; user: PresenceUser }>>({});

  useEffect(() => {
    if (!tripId) {
      setUsers([]);
      setCursors({});
      return;
    }

    const me = getOrCreateIdentity();
    const channel = supabase.channel(`presence-${tripId}`, {
      config: { presence: { key: me.userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        const list: PresenceUser[] = [];
        Object.values(state).forEach((entries) => {
          if (entries[0]) list.push(entries[0]);
        });
        setUsers(list);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (!payload || payload.userId === me.userId) return;
        setCursors((prev) => ({
          ...prev,
          [payload.userId]: { x: payload.x, y: payload.y, user: payload.user },
        }));
      })
      .on('broadcast', { event: 'cursor-leave' }, ({ payload }) => {
        setCursors((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: me.userId,
            name: me.name,
            color: me.color,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Throttled cursor broadcast
    let lastSent = 0;
    const onMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - lastSent < 50) return;
      lastSent = now;
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          userId: me.userId,
          x: e.clientX,
          y: e.clientY,
          user: me,
        },
      });
    };
    const onLeave = () => {
      channel.send({
        type: 'broadcast',
        event: 'cursor-leave',
        payload: { userId: me.userId },
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  return { users, cursors };
}
