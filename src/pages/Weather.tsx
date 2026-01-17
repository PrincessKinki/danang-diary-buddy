import { WeatherWidget } from '@/components/WeatherWidget';
import { getTripInfo } from '@/lib/storage';
import { useState, useEffect } from 'react';
import type { TripInfo } from '@/types/travel';

const Weather = () => {
  const [tripInfo, setTripInfo] = useState<TripInfo>(getTripInfo());

  useEffect(() => {
    setTripInfo(getTripInfo());
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-tropical p-4 pt-safe">
        <h1 className="text-xl font-bold text-primary-foreground">天氣</h1>
        <p className="text-primary-foreground/80 text-sm">查看當地天氣預報</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <WeatherWidget destination={tripInfo.destination} />
      </div>
    </div>
  );
};

export default Weather;
