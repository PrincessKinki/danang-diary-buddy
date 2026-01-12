import { Place, Expense, ShoppingItem, TripInfo } from '@/types/travel';

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

export const saveTripInfo = (info: TripInfo) => {
  localStorage.setItem(STORAGE_KEYS.TRIP_INFO, JSON.stringify(info));
};

// Places
export const getPlaces = (): Place[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PLACES);
  return stored ? JSON.parse(stored) : [];
};

export const savePlaces = (places: Place[]) => {
  localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(places));
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
