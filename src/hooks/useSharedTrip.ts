import { useEffect, useRef, useState } from 'react';
import {
  getTripIdFromURL,
  getTrip,
  hydrateFromTrip,
  subscribeToTrip,
  updateTrip,
  getTripInfo,
  getPlaces,
  getExpenses,
  getShoppingItems,
} from '@/lib/storage';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Loads a shared trip from URL (?trip=...) and keeps localStorage in sync.
 * Also pushes local changes back to the shared trip (debounced).
 */
export function useSharedTrip() {
  const [tripId, setTripId] = useState<string | null>(getTripIdFromURL());
  const [loading, setLoading] = useState<boolean>(!!tripId);
  const isApplyingRemote = useRef(false);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!tripId) return;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const trip = await getTrip(tripId);
        if (trip) {
          isApplyingRemote.current = true;
          hydrateFromTrip(trip);
          window.dispatchEvent(new Event('trip-hydrated'));
          isApplyingRemote.current = false;
        }
      } catch (e) {
        console.error('Load shared trip failed:', e);
      } finally {
        setLoading(false);
      }

      unsubscribe = subscribeToTrip(tripId, (trip) => {
        isApplyingRemote.current = true;
        hydrateFromTrip(trip);
        window.dispatchEvent(new Event('trip-hydrated'));
        setTimeout(() => {
          isApplyingRemote.current = false;
        }, 100);
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, [tripId]);

  // Watch URL changes (e.g. after sharing)
  useEffect(() => {
    const handler = () => setTripId(getTripIdFromURL());
    window.addEventListener('popstate', handler);
    window.addEventListener('trip-id-changed', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('trip-id-changed', handler);
    };
  }, []);

  // Push local changes to remote (debounced via storage events)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onLocal = () => {
      if (isApplyingRemote.current) return;
      setTick((t) => t + 1);
    };
    window.addEventListener('local-trip-changed', onLocal);
    return () => window.removeEventListener('local-trip-changed', onLocal);
  }, []);

  const debouncedTick = useDebounce(tick, 600);
  useEffect(() => {
    if (!tripId || debouncedTick === 0) return;
    updateTrip(tripId, {
      tripInfo: getTripInfo(),
      places: getPlaces(),
      expenses: getExpenses(),
      shopping: getShoppingItems(),
    }).catch((e) => console.error('Sync failed:', e));
  }, [debouncedTick, tripId]);

  return { tripId, loading };
}
