import { useState, useEffect } from 'react';
import { PlaceList } from '@/components/PlaceList';
import { getPlaces, addPlace, updatePlace, deletePlace } from '@/lib/storage';
import type { Place } from '@/types/travel';
import { QubyMascot } from '@/components/QubyMascot';

const Itinerary = () => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    setPlaces(getPlaces());
  }, []);

  const handleAdd = (place: Omit<Place, 'id' | 'createdAt'>) => {
    const newPlace = addPlace(place);
    setPlaces([...places, newPlace]);
  };

  const handleUpdate = (id: string, updates: Partial<Place>) => {
    const updatedPlaces = updatePlace(id, updates);
    setPlaces(updatedPlaces);
  };

  const handleDelete = (id: string) => {
    const updatedPlaces = deletePlace(id);
    setPlaces(updatedPlaces);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-tropical p-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">行程安排</h1>
            <p className="text-primary-foreground/80 text-sm">
              {places.length} 個地點 · {places.filter(p => p.completed).length} 已完成
            </p>
          </div>
          <QubyMascot size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <PlaceList
          places={places}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Itinerary;
