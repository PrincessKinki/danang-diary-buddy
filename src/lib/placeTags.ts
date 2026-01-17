const STORAGE_KEY = 'place_tags';

export const getPlaceTags = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : ['必去', '美食', '拍照', '購物', '放鬆'];
};

export const savePlaceTags = (tags: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
};

export const addPlaceTag = (tag: string): string[] => {
  const tags = getPlaceTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    savePlaceTags(tags);
  }
  return tags;
};

export const removePlaceTag = (tag: string): string[] => {
  const tags = getPlaceTags().filter(t => t !== tag);
  savePlaceTags(tags);
  return tags;
};
