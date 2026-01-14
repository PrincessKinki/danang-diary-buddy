import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { QubyMascot } from '@/components/QubyMascot';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getTripInfo, saveTripInfo, getPlaces, getExpenses } from '@/lib/storage';
import type { TripInfo } from '@/types/travel';

// Background images for different destinations
const destinationBackgrounds: Record<string, string> = {
  'da nang': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
  'vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&h=600&fit=crop',
  'hanoi': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&h=600&fit=crop',
  'ho chi minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
  'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  'korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop',
  'seoul': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=600&fit=crop',
  'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
  'taiwan': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&h=600&fit=crop',
  'taipei': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&h=600&fit=crop',
  'hong kong': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
  'malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'
};

const getBackgroundForDestination = (destination: string): string => {
  const lowerDest = destination.toLowerCase();
  for (const [key, url] of Object.entries(destinationBackgrounds)) {
    if (lowerDest.includes(key)) {
      return url;
    }
  }
  return destinationBackgrounds['default'];
};

const Index = () => {
  const [tripInfo, setTripInfo] = useState<TripInfo>(getTripInfo());
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editData, setEditData] = useState(tripInfo);
  const [placesCount, setPlacesCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    setPlacesCount(getPlaces().length);
    const expenses = getExpenses();
    const total = expenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0);
    setTotalExpenses(total);
  }, []);

  const handleUpdateTrip = () => {
    saveTripInfo(editData);
    setTripInfo(editData);
    setIsEditingTrip(false);
  };

  const backgroundUrl = getBackgroundForDestination(tripInfo.destination);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={backgroundUrl}
          alt={tripInfo.destination}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">
                {tripInfo.destination}
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                {new Date(tripInfo.startDate).toLocaleDateString('zh-TW')} - {new Date(tripInfo.endDate).toLocaleDateString('zh-TW')}
              </p>
            </div>
            <Dialog open={isEditingTrip} onOpenChange={setIsEditingTrip}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>編輯旅程資訊</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">目的地</label>
                    <Input
                      value={editData.destination}
                      onChange={(e) => setEditData({ ...editData, destination: e.target.value })}
                      placeholder="例如: Da Nang, Vietnam"
                    />
                    <p className="text-xs text-muted-foreground mt-1">背景圖片會根據目的地自動更換</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">開始日期</label>
                      <Input
                        type="date"
                        value={editData.startDate}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">結束日期</label>
                      <Input
                        type="date"
                        value={editData.endDate}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleUpdateTrip} className="w-full">儲存</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 space-y-4 relative z-10">
        {/* Weather */}
        <WeatherWidget destination={tripInfo.destination} />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">🗓️</span>
            <p className="text-lg font-bold text-foreground mt-1">
              {Math.ceil((new Date(tripInfo.endDate).getTime() - new Date(tripInfo.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
            </p>
            <p className="text-xs text-muted-foreground">天數</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">📍</span>
            <p className="text-lg font-bold text-foreground mt-1">{placesCount}</p>
            <p className="text-xs text-muted-foreground">景點</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">💰</span>
            <p className="text-lg font-bold text-foreground mt-1">HK${totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">支出</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
