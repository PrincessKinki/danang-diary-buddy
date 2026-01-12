import { useState, useEffect } from 'react';
import { Settings, Edit2 } from 'lucide-react';
import { QubyMascot } from '@/components/QubyMascot';
import { CountdownTimer } from '@/components/CountdownTimer';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AccommodationCard } from '@/components/AccommodationCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getTripInfo, saveTripInfo } from '@/lib/storage';
import type { TripInfo } from '@/types/travel';
import heroImage from '@/assets/danang-hero.jpg';

const Index = () => {
  const [tripInfo, setTripInfo] = useState<TripInfo>(getTripInfo());
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editData, setEditData] = useState(tripInfo);

  const handleUpdateTrip = () => {
    saveTripInfo(editData);
    setTripInfo(editData);
    setIsEditingTrip(false);
  };

  const handleUpdateAccommodation = (updates: Partial<TripInfo>) => {
    const newInfo = { ...tripInfo, ...updates };
    saveTripInfo(newInfo);
    setTripInfo(newInfo);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={heroImage}
          alt="Da Nang Vietnam"
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
                    />
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
        
        {/* Quby Mascot */}
        <div className="absolute top-4 right-4">
          <QubyMascot size="sm" message="歡迎來到峴港！🇻🇳" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 space-y-4 relative z-10">
        {/* Countdown */}
        <CountdownTimer 
          targetDate={tripInfo.startDate} 
          label="距離出發還有"
        />

        {/* Weather */}
        <WeatherWidget />

        {/* Accommodation */}
        <AccommodationCard 
          tripInfo={tripInfo}
          onUpdate={handleUpdateAccommodation}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">🗓️</span>
            <p className="text-lg font-bold text-foreground mt-1">
              {Math.ceil((new Date(tripInfo.endDate).getTime() - new Date(tripInfo.startDate).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-xs text-muted-foreground">天數</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">📍</span>
            <p className="text-lg font-bold text-foreground mt-1">0</p>
            <p className="text-xs text-muted-foreground">景點</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card text-center">
            <span className="text-2xl">💰</span>
            <p className="text-lg font-bold text-foreground mt-1">HK$0</p>
            <p className="text-xs text-muted-foreground">支出</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
