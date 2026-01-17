import { useState, useEffect, useMemo } from 'react';
import { PlaceList } from '@/components/PlaceList';
import { getPlaces, addPlace, updatePlace, deletePlace, getTripInfo } from '@/lib/storage';
import { getPlaceTags, addPlaceTag, removePlaceTag } from '@/lib/placeTags';
import type { Place, TripInfo } from '@/types/travel';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Calendar, Tag, Plus, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Itinerary = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [tripInfo, setTripInfo] = useState<TripInfo>(getTripInfo());
  const [activeDay, setActiveDay] = useState('all');
  const [tags, setTags] = useState<string[]>(getPlaceTags());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setPlaces(getPlaces());
    setTripInfo(getTripInfo());
    setTags(getPlaceTags());
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

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const updated = addPlaceTag(newTagName.trim());
    setTags(updated);
    setNewTagName('');
    setIsAddTagOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    const updated = removePlaceTag(tag);
    setTags(updated);
    if (selectedTag === tag) {
      setSelectedTag(null);
    }
  };

  // Filter places by selected day and tag
  const filteredPlaces = useMemo(() => {
    let result = places;
    
    // Filter by day
    if (activeDay === 'unscheduled') {
      result = result.filter(p => !p.scheduledDate);
    } else if (activeDay !== 'all') {
      result = result.filter(p => p.scheduledDate === activeDay);
    }
    
    // Filter by tag (using notes field as tags storage)
    if (selectedTag) {
      result = result.filter(p => p.notes?.includes(`#${selectedTag}`));
    }
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [places, activeDay, selectedTag, searchQuery]);

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

      {/* Tags Section */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              !selectedTag
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            全部標籤
          </button>
          {tags.map((tag) => (
            <div key={tag} className="relative group flex-shrink-0">
              <button
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                #{tag}
              </button>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
            <DialogTrigger asChild>
              <button className="px-2 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1 whitespace-nowrap">
                <Plus className="w-3 h-3" />
                新增標籤
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增標籤</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="輸入標籤名稱..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} className="w-full" disabled={!newTagName.trim()}>
                  新增
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
      <div className="p-4 space-y-4">
        {/* Search at bottom */}
        <PlaceList
          places={filteredPlaces}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          tripDays={tripDays}
          onMoveToDay={handleMoveToDay}
        />
        
        {/* Search Bar at Bottom */}
        <div className="sticky bottom-20 bg-card rounded-xl shadow-card p-3 border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋地點..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
