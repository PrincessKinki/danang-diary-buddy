import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun, Droplets } from 'lucide-react';
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

// Mock weather data for Da Nang
const mockWeather: WeatherData = {
  temperature: 28,
  condition: 'sunny',
  humidity: 75,
  high: 32,
  low: 24,
  hourlyForecast: [
    { hour: '現在', temperature: 28, condition: 'sunny' },
    { hour: '14:00', temperature: 30, condition: 'sunny' },
    { hour: '15:00', temperature: 31, condition: 'partly-cloudy' },
    { hour: '16:00', temperature: 30, condition: 'partly-cloudy' },
    { hour: '17:00', temperature: 28, condition: 'cloudy' },
    { hour: '18:00', temperature: 26, condition: 'cloudy' },
    { hour: '19:00', temperature: 25, condition: 'partly-cloudy' },
  ]
};

export const WeatherWidget = () => {
  const [weather] = useState<WeatherData>(mockWeather);
  const Icon = conditionIcons[weather.condition];

  return (
    <div className={`bg-gradient-to-br ${conditionBg[weather.condition]} rounded-2xl p-5 shadow-card overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">峴港天氣</h3>
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
      
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {weather.hourlyForecast.map((hour, idx) => {
          const HourIcon = conditionIcons[hour.condition];
          return (
            <div 
              key={idx} 
              className={`flex flex-col items-center min-w-[50px] py-2 px-2 rounded-xl ${
                idx === 0 ? 'bg-primary/10' : ''
              }`}
            >
              <span className="text-xs text-muted-foreground">{hour.hour}</span>
              <HourIcon className="w-5 h-5 my-2 text-secondary" />
              <span className="text-sm font-medium text-foreground">{hour.temperature}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
