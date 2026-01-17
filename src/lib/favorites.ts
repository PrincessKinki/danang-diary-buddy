export interface FavoritePhrase {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: string;
}

const STORAGE_KEY = 'favorite_phrases';

export const getFavoritePhrases = (): FavoritePhrase[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveFavoritePhrases = (phrases: FavoritePhrase[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
};

export const addFavoritePhrase = (phrase: Omit<FavoritePhrase, 'id' | 'createdAt'>): FavoritePhrase => {
  const phrases = getFavoritePhrases();
  const newPhrase: FavoritePhrase = {
    ...phrase,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  phrases.push(newPhrase);
  saveFavoritePhrases(phrases);
  return newPhrase;
};

export const removeFavoritePhrase = (id: string): FavoritePhrase[] => {
  const phrases = getFavoritePhrases().filter(p => p.id !== id);
  saveFavoritePhrases(phrases);
  return phrases;
};

export const isFavoritePhrase = (sourceText: string, targetLang: string): boolean => {
  const phrases = getFavoritePhrases();
  return phrases.some(p => p.sourceText === sourceText && p.targetLang === targetLang);
};
