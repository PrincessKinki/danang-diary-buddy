import { Place, Expense, ShoppingItem, TripInfo } from '@/types/travel';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEYS = {
  TRIP_INFO: 'danang_trip_info',
  PLACES: 'danang_places',
  EXPENSES: 'danang_expenses',
  SHOPPING: 'danang_shopping',
  CURRENCY_SETTINGS: 'danang_currency'
};

// Trip Info
export const getTripInfo = (): TripInfo => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRIP_INFO);
  if (stored) return JSON.parse(stored);
  
  return {
    destination: 'Da Nang, Vietnam',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    accommodation: {
      name: 'Your Hotel',
      address: 'Da Nang, Vietnam',
      googleMapsUrl: 'https://maps.google.com/?q=Da+Nang+Vietnam'
    }
  };
};

const emitLocalChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('local-trip-changed'));
  }
};

export const saveTripInfo = (info: TripInfo) => {
  localStorage.setItem(STORAGE_KEYS.TRIP_INFO, JSON.stringify(info));
  emitLocalChange();
};

// Places
export const getPlaces = (): Place[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PLACES);
  return stored ? JSON.parse(stored) : [];
};

export const savePlaces = (places: Place[]) => {
  localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
  emitLocalChange();
};

export const addPlace = (place: Omit<Place, 'id' | 'createdAt'>) => {
  const places = getPlaces();
  const newPlace: Place = {
    ...place,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  places.push(newPlace);
  savePlaces(places);
  return newPlace;
};

export const updatePlace = (id: string, updates: Partial<Place>) => {
  const places = getPlaces();
  const index = places.findIndex(p => p.id === id);
  if (index !== -1) {
    places[index] = { ...places[index], ...updates };
    savePlaces(places);
  }
  return places;
};

export const deletePlace = (id: string) => {
  const places = getPlaces().filter(p => p.id !== id);
  savePlaces(places);
  return places;
};

// Expenses
export const getExpenses = (): Expense[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return stored ? JSON.parse(stored) : [];
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  emitLocalChange();
};

export const addExpense = (expense: Omit<Expense, 'id'>) => {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID()
  };
  expenses.push(newExpense);
  saveExpenses(expenses);
  return newExpense;
};

export const deleteExpense = (id: string) => {
  const expenses = getExpenses().filter(e => e.id !== id);
  saveExpenses(expenses);
  return expenses;
};

// Shopping
export const getShoppingItems = (): ShoppingItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING);
  return stored ? JSON.parse(stored) : [];
};

export const saveShoppingItems = (items: ShoppingItem[]) => {
  localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
  emitLocalChange();
};

export const addShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
  const items = getShoppingItems();
  const newItem: ShoppingItem = {
    ...item,
    id: crypto.randomUUID()
  };
  items.push(newItem);
  saveShoppingItems(items);
  return newItem;
};

export const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
  const items = getShoppingItems();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveShoppingItems(items);
  }
  return items;
};

export const deleteShoppingItem = (id: string) => {
  const items = getShoppingItems().filter(i => i.id !== id);
  saveShoppingItems(items);
  return items;
};

// Currency Settings
export interface CurrencySettings {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

export const getCurrencySettings = (): CurrencySettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY_SETTINGS);
  return stored ? JSON.parse(stored) : {
    baseCurrency: 'HKD',
    targetCurrency: 'VND',
    rate: 3050
  };
};

export const saveCurrencySettings = (settings: CurrencySettings) => {
  localStorage.setItem(STORAGE_KEYS.CURRENCY_SETTINGS, JSON.stringify(settings));
};


// ============= Shared Trip (Supabase) =============
export const createTrip = async (tripInfo: TripInfo, places: Place[]): Promise<string> => {
  const expenses = getExpenses();
  const shopping = getShoppingItems();
  const { data, error } = await supabase
    .from('trips')
    .insert({
      destination: tripInfo.destination,
      start_date: tripInfo.startDate,
      end_date: tripInfo.endDate,
      accommodation: tripInfo.accommodation as any,
      places: places as any,
      expenses: expenses as any,
      shopping: shopping as any,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
};

export const getTrip = async (tripId: string) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateTrip = async (
  tripId: string,
  updates: { tripInfo?: TripInfo; places?: Place[]; expenses?: Expense[]; shopping?: ShoppingItem[] }
) => {
  const payload: Record<string, any> = {};
  if (updates.tripInfo) {
    payload.destination = updates.tripInfo.destination;
    payload.start_date = updates.tripInfo.startDate;
    payload.end_date = updates.tripInfo.endDate;
    payload.accommodation = updates.tripInfo.accommodation;
  }
  if (updates.places !== undefined) payload.places = updates.places;
  if (updates.expenses !== undefined) payload.expenses = updates.expenses;
  if (updates.shopping !== undefined) payload.shopping = updates.shopping;

  const { error } = await supabase.from('trips').update(payload).eq('id', tripId);
  if (error) throw error;
};

export const getTripIdFromURL = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('trip');
};

export const setTripIdToURL = (tripId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('trip', tripId);
  window.history.pushState({}, '', url.toString());
  window.dispatchEvent(new Event('trip-id-changed'));
};

// Hydrate localStorage from a remote shared trip
export const hydrateFromTrip = (trip: any) => {
  if (!trip) return;
  const tripInfo: TripInfo = {
    destination: trip.destination ?? '',
    startDate: trip.start_date ?? new Date().toISOString().split('T')[0],
    endDate: trip.end_date ?? new Date().toISOString().split('T')[0],
    accommodation: trip.accommodation ?? { name: '', address: '', googleMapsUrl: '' },
  };
  saveTripInfo(tripInfo);
  savePlaces(trip.places ?? []);
  saveExpenses(trip.expenses ?? []);
  saveShoppingItems(trip.shopping ?? []);
};

// Subscribe to realtime updates for a shared trip
export const subscribeToTrip = (tripId: string, onChange: (trip: any) => void) => {
  const channel = supabase
    .channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
      (payload) => {
        if (payload.new) onChange(payload.new);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};
