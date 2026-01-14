import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun, Droplets, Umbrella } from 'lucide-react';
import type { WeatherData } from '@/types/travel';

const conditionIcons = {
  'sunny': Sun,
  'cloudy': Cloud,
  'rainy': CloudRain,
  'stormy': CloudLightning,
  'partly-cloudy': CloudSun
};

const conditionBg = {
  'sunny': 'from-secondary/20 to-warning/10',
  'cloudy': 'from-muted to-muted/50',
  'rainy': 'from-primary/20 to-muted',
  'stormy': 'from-secondary/30 to-muted',
  'partly-cloudy': 'from-secondary/10 to-primary/10'
};

// Mock weather data for different locations
const getWeatherForLocation = (destination: string): WeatherData & { rainPeriods?: { start: string; end: string; chance: number }[], location: string } => {
  const lowerDest = destination.toLowerCase();
  
  if (lowerDest.includes('da nang') || lowerDest.includes('vietnam')) {
    return {
      location: '峴港',
      temperature: 28,
      condition: 'rainy',
      humidity: 85,
      high: 32,
      low: 24,
      rainPeriods: [
        { start: '14:00', end: '16:00', chance: 80 },
        { start: '19:00', end: '21:00', chance: 60 }
      ],
      hourlyForecast: [
        { hour: '現在', temperature: 28, condition: 'cloudy' },
        { hour: '14:00', temperature: 27, condition: 'rainy' },
        { hour: '15:00', temperature: 26, condition: 'rainy' },
        { hour: '16:00', temperature: 27, condition: 'cloudy' },
        { hour: '17:00', temperature: 28, condition: 'partly-cloudy' },
        { hour: '18:00', temperature: 26, condition: 'cloudy' },
        { hour: '19:00', temperature: 25, condition: 'rainy' },
      ]
    };
  }
  
  if (lowerDest.includes('tokyo') || lowerDest.includes('japan')) {
    return {
      location: '東京',
      temperature: 22,
      condition: 'partly-cloudy',
      humidity: 65,
      high: 25,
      low: 18,
      rainPeriods: [
        { start: '18:00', end: '20:00', chance: 40 }
      ],
      hourlyForecast: [
        { hour: '現在', temperature: 22, condition: 'partly-cloudy' },
        { hour: '14:00', temperature: 24, condition: 'sunny' },
        { hour: '15:00', temperature: 25, condition: 'sunny' },
        { hour: '16:00', temperature: 24, condition: 'partly-cloudy' },
        { hour: '17:00', temperature: 23, condition: 'cloudy' },
        { hour: '18:00', temperature: 21, condition: 'rainy' },
        { hour: '19:00', temperature: 20, condition: 'rainy' },
      ]
    };
  }
  
  // Default weather
  return {
    location: destination.split(',')[0] || '目的地',
    temperature: 25,
    condition: 'sunny',
    humidity: 70,
    high: 28,
    low: 22,
    rainPeriods: [],
    hourlyForecast: [
      { hour: '現在', temperature: 25, condition: 'sunny' },
      { hour: '14:00', temperature: 27, condition: 'sunny' },
      { hour: '15:00', temperature: 28, condition: 'sunny' },
      { hour: '16:00', temperature: 27, condition: 'partly-cloudy' },
      { hour: '17:00', temperature: 26, condition: 'partly-cloudy' },
      { hour: '18:00', temperature: 24, condition: 'cloudy' },
      { hour: '19:00', temperature: 23, condition: 'cloudy' },
    ]
  };
};

interface WeatherWidgetProps {
  destination?: string;
}

export const WeatherWidget = ({ destination = 'Da Nang, Vietnam' }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState(getWeatherForLocation(destination));
  
  useEffect(() => {
    setWeather(getWeatherForLocation(destination));
  }, [destination]);
  
  const Icon = conditionIcons[weather.condition];
  const hasRain = weather.condition === 'rainy' || weather.condition === 'stormy' || 
    weather.hourlyForecast.some(h => h.condition === 'rainy' || h.condition === 'stormy');

  return (
    <div className={`bg-gradient-to-br ${conditionBg[weather.condition]} rounded-2xl p-5 shadow-card overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{weather.location}天氣</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-5xl font-bold text-foreground">{weather.temperature}</span>
            <span className="text-2xl text-muted-foreground">°C</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>高 {weather.high}°</span>
            <span>低 {weather.low}°</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Icon className="w-12 h-12 text-secondary" />
          <div className="flex items-center gap-1 mt-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{weather.humidity}%</span>
          </div>
        </div>
      </div>
      
      {/* Rain Period Alert - iOS Style */}
      {hasRain && weather.rainPeriods && weather.rainPeriods.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Umbrella className="w-4 h-4" />
            <span className="text-sm font-medium">預計降雨時間</span>
          </div>
          <div className="space-y-1.5">
            {weather.rainPeriods.map((period, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {period.start} - {period.end}
                </span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {period.chance}% 機率
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {weather.hourlyForecast.map((hour, idx) => {
          const HourIcon = conditionIcons[hour.condition];
          const isRainy = hour.condition === 'rainy' || hour.condition === 'stormy';
          return (
            <div 
              key={idx} 
              className={`flex flex-col items-center min-w-[50px] py-2 px-2 rounded-xl ${
                idx === 0 ? 'bg-primary/10' : ''
              } ${isRainy ? 'bg-primary/5' : ''}`}
            >
              <span className="text-xs text-muted-foreground">{hour.hour}</span>
              <HourIcon className={`w-5 h-5 my-2 ${isRainy ? 'text-primary' : 'text-secondary'}`} />
              <span className="text-sm font-medium text-foreground">{hour.temperature}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
