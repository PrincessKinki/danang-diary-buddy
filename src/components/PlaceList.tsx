import { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, Heart, Trash2, Check, ExternalLink, Search, X, Star, Navigation, Edit2, GripVertical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Place, PlaceCategory } from '@/types/travel';
import { useDebounce } from '@/hooks/useDebounce';

const categoryLabels: Record<PlaceCategory, string> = {
  food: '🍜 美食',
  attraction: '🏛️ 景點',
  shopping: '🛍️ 購物',
  cafe: '☕ 咖啡店',
  nightlife: '🌙 夜生活',
  nature: '🌴 自然',
  culture: '🎭 文化',
  other: '📍 其他'
};

const categoryColors: Record<PlaceCategory, string> = {
  food: 'bg-secondary/20 text-secondary-foreground',
  attraction: 'bg-primary/20 text-primary',
  shopping: 'bg-accent text-accent-foreground',
  cafe: 'bg-warning/20 text-warning-foreground',
  nightlife: 'bg-chart-4/20 text-chart-4',
  nature: 'bg-success/20 text-success',
  culture: 'bg-chart-3/20 text-chart-3',
  other: 'bg-muted text-muted-foreground'
};

interface TripDay {
  day: number;
  date: string;
  label: string;
}

interface PlaceListProps {
  places: Place[];
  onAdd: (place: Omit<Place, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Place>) => void;
  onDelete: (id: string) => void;
  tripDays?: TripDay[];
  onMoveToDay?: (placeId: string, date: string) => void;
}

export const PlaceList = ({ places, onAdd, onUpdate, onDelete, tripDays, onMoveToDay }: PlaceListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [newPlace, setNewPlace] = useState({
    name: '',
    category: 'attraction' as PlaceCategory,
    googleMapsUrl: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PlaceCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Google Maps search state
  const [showMapSearch, setShowMapSearch] = useState(false);
  const debouncedPlaceName = useDebounce(newPlace.name, 500);

  const filteredPlaces = places
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => showCompleted || !p.completed)
    .sort((a, b) => {
      // Sort by date, then by favorite status
      if (a.scheduledDate && b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      if (a.scheduledDate) return -1;
      if (b.scheduledDate) return 1;
      return Number(b.isFavorite) - Number(a.isFavorite);
    });

  const handleAdd = () => {
    if (!newPlace.name) return;
    onAdd({
      ...newPlace,
      completed: false,
      isFavorite: false
    });
    setNewPlace({
      name: '',
      category: 'attraction',
      googleMapsUrl: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: ''
    });
    setIsAddOpen(false);
  };

  const handleEditSave = () => {
    if (!editingPlace) return;
    onUpdate(editingPlace.id, {
      name: editingPlace.name,
      category: editingPlace.category,
      googleMapsUrl: editingPlace.googleMapsUrl,
      scheduledDate: editingPlace.scheduledDate,
      scheduledTime: editingPlace.scheduledTime,
      notes: editingPlace.notes
    });
    setEditingPlace(null);
  };

  // Auto-show map search when typing place name
  useEffect(() => {
    if (debouncedPlaceName.length >= 2) {
      setShowMapSearch(true);
    }
  }, [debouncedPlaceName]);

  const getGoogleMapsEmbedUrl = (placeName: string) => {
    if (!placeName) return '';
    const query = encodeURIComponent(placeName + ' Da Nang Vietnam');
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}`;
  };

  const handleComplete = (place: Place) => {
    onUpdate(place.id, { completed: !place.completed });
  };

  // Calculate mock distance from accommodation (for demo)
  const getDistanceFromAccommodation = (placeName: string) => {
    // Mock distances based on place name hash
    const hash = placeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return ((hash % 50) / 10 + 0.5).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜尋地點..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as PlaceCategory | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Place List */}
      <div className="space-y-3">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className={`bg-card rounded-xl p-4 shadow-card transition-all duration-300 ${
              place.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleComplete(place)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  place.completed 
                    ? 'bg-success border-success' 
                    : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {place.completed && <Check className="w-4 h-4 text-success-foreground" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold text-foreground ${place.completed ? 'line-through' : ''}`}>
                    {place.name}
                  </h3>
                  {place.isFavorite && <Star className="w-4 h-4 text-secondary fill-secondary" />}
                </div>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[place.category]}`}>
                    {categoryLabels[place.category]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {getDistanceFromAccommodation(place.name)} km
                  </span>
                  {place.scheduledDate && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(place.scheduledDate).toLocaleDateString('zh-TW')}
                      {place.scheduledTime && ` ${place.scheduledTime}`}
                    </span>
                  )}
                </div>
                
                {place.notes && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{place.notes}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {/* Day Move Button */}
                {tripDays && onMoveToDay && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="移動到其他天"
                      >
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <p className="text-xs font-medium text-muted-foreground mb-2">移動到：</p>
                      <div className="space-y-1">
                        {tripDays.map((day) => (
                          <button
                            key={day.date}
                            onClick={() => onMoveToDay(place.id, day.date)}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                              place.scheduledDate === day.date
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            Day {day.day} - {day.label}
                          </button>
                        ))}
                        <button
                          onClick={() => onMoveToDay(place.id, '')}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                            !place.scheduledDate
                              ? 'bg-secondary text-secondary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          未排期
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingPlace(place)}
                  title="編輯地點"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdate(place.id, { isFavorite: !place.isFavorite })}
                >
                  <Heart className={`w-4 h-4 ${place.isFavorite ? 'fill-accent text-accent' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (place.googleMapsUrl) {
                      window.open(place.googleMapsUrl, '_blank');
                    } else {
                      const query = encodeURIComponent(place.name + ' Da Nang Vietnam');
                      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
                    }
                  }}
                  title="在 Google Maps 開啟"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(place.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPlaces.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>還沒有地點，新增一個吧！</p>
          </div>
        )}
      </div>

      {/* Edit Place Dialog */}
      <Dialog open={!!editingPlace} onOpenChange={(open) => !open && setEditingPlace(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>編輯地點</DialogTitle>
          </DialogHeader>
          {editingPlace && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm font-medium mb-1.5 block">地點名稱</label>
                <Input
                  value={editingPlace.name}
                  onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">分類</label>
                <Select 
                  value={editingPlace.category} 
                  onValueChange={(v) => setEditingPlace({ ...editingPlace, category: v as PlaceCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Google Maps 連結</label>
                <Input
                  placeholder="貼上 Google Maps 連結..."
                  value={editingPlace.googleMapsUrl}
                  onChange={(e) => setEditingPlace({ ...editingPlace, googleMapsUrl: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">日期</label>
                  <Input
                    type="date"
                    value={editingPlace.scheduledDate || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">時間</label>
                  <Input
                    type="time"
                    value={editingPlace.scheduledTime || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">備註</label>
                <Input
                  placeholder="添加備註..."
                  value={editingPlace.notes || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, notes: e.target.value })}
                />
              </div>
              
              <Button onClick={handleEditSave} className="w-full">儲存變更</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-tropical hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            新增地點
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增地點</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium mb-1.5 block">地點名稱</label>
              <Input
                placeholder="輸入地點名稱搜尋..."
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
              />
            </div>
            
            {/* Google Maps Embed Search */}
            {showMapSearch && debouncedPlaceName.length >= 2 && (
              <div className="rounded-xl overflow-hidden border border-border">
                <div className="bg-muted px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Google Maps 搜尋結果
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMapSearch(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <iframe
                  src={getGoogleMapsEmbedUrl(debouncedPlaceName)}
                  className="w-full h-48 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">確認此位置正確嗎？</p>
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => {
                      const query = encodeURIComponent(debouncedPlaceName + ' Da Nang Vietnam');
                      setNewPlace({
                        ...newPlace,
                        googleMapsUrl: `https://www.google.com/maps/search/${query}`
                      });
                      setShowMapSearch(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    確認地點
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">分類</label>
              <Select 
                value={newPlace.category} 
                onValueChange={(v) => setNewPlace({ ...newPlace, category: v as PlaceCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Google Maps 連結 (選填)</label>
              <Input
                placeholder="貼上 Google Maps 連結..."
                value={newPlace.googleMapsUrl}
                onChange={(e) => setNewPlace({ ...newPlace, googleMapsUrl: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">日期 (選填)</label>
                <Input
                  type="date"
                  value={newPlace.scheduledDate}
                  onChange={(e) => setNewPlace({ ...newPlace, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">時間 (選填)</label>
                <Input
                  type="time"
                  value={newPlace.scheduledTime}
                  onChange={(e) => setNewPlace({ ...newPlace, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">備註 (選填)</label>
              <Input
                placeholder="添加備註..."
                value={newPlace.notes}
                onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
              />
            </div>
            
            <Button onClick={handleAdd} className="w-full" disabled={!newPlace.name}>
              新增地點
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
