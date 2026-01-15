import { useState, useEffect, useMemo } from 'react';
import { PlaceList } from '@/components/PlaceList';
import { getPlaces, addPlace, updatePlace, deletePlace, getTripInfo } from '@/lib/storage';
import type { Place, TripInfo } from '@/types/travel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { GripVertical, Calendar } from 'lucide-react';

const Itinerary = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [tripInfo, setTripInfo] = useState<TripInfo>(getTripInfo());
  const [activeDay, setActiveDay] = useState('all');

  useEffect(() => {
    setPlaces(getPlaces());
    setTripInfo(getTripInfo());
  }, []);

  // Calculate trip days
  const tripDays = useMemo(() => {
    const start = parseISO(tripInfo.startDate);
    const end = parseISO(tripInfo.endDate);
    const numDays = differenceInDays(end, start) + 1;
    
    return Array.from({ length: numDays }, (_, i) => {
      const date = addDays(start, i);
      return {
        day: i + 1,
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'M/d (EEE)', { locale: zhTW })
      };
    });
  }, [tripInfo.startDate, tripInfo.endDate]);

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

  // Move place between days
  const handleMoveToDay = (placeId: string, newDate: string) => {
    handleUpdate(placeId, { scheduledDate: newDate });
  };

  // Filter places by selected day
  const filteredPlaces = useMemo(() => {
    if (activeDay === 'all') return places;
    if (activeDay === 'unscheduled') return places.filter(p => !p.scheduledDate);
    return places.filter(p => p.scheduledDate === activeDay);
  }, [places, activeDay]);

  // Count places per day
  const placesCountByDay = useMemo(() => {
    const counts: Record<string, number> = { all: places.length, unscheduled: 0 };
    tripDays.forEach(day => {
      counts[day.date] = places.filter(p => p.scheduledDate === day.date).length;
    });
    counts.unscheduled = places.filter(p => !p.scheduledDate).length;
    return counts;
  }, [places, tripDays]);

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
        </div>
      </div>

      {/* Day Tabs */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex p-2 gap-2 min-w-max">
            <button
              onClick={() => setActiveDay('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeDay === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              全部 ({placesCountByDay.all})
            </button>
            {tripDays.map((day) => (
              <button
                key={day.date}
                onClick={() => setActiveDay(day.date)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  activeDay === day.date 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Day {day.day} {day.label}
                {placesCountByDay[day.date] > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-background/20 rounded-full text-xs">
                    {placesCountByDay[day.date]}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => setActiveDay('unscheduled')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeDay === 'unscheduled' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              未排期 ({placesCountByDay.unscheduled})
            </button>
          </div>
        </div>
      </div>

      {/* Quick Day Assign Buttons */}
      {activeDay === 'unscheduled' && filteredPlaces.length > 0 && (
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">快速分配到：</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tripDays.map((day) => (
              <button
                key={day.date}
                onClick={() => {
                  // Assign first unscheduled place to this day
                  const firstUnscheduled = filteredPlaces[0];
                  if (firstUnscheduled) {
                    handleMoveToDay(firstUnscheduled.id, day.date);
                  }
                }}
                className="px-2 py-1 bg-card rounded-lg text-xs border border-border hover:border-primary transition-colors whitespace-nowrap"
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <PlaceList
          places={filteredPlaces}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          tripDays={tripDays}
          onMoveToDay={handleMoveToDay}
        />
      </div>
    </div>
  );
};

export default Itinerary;
