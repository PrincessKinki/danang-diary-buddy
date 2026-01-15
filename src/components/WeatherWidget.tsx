import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun, Droplets, Umbrella, ExternalLink, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
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

// Popular cities organized by country/region
const popularLocations = [
  { country: '越南', cities: ['Da Nang', 'Hanoi', 'Ho Chi Minh City', 'Nha Trang', 'Hoi An'] },
  { country: '日本', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Okinawa'] },
  { country: '韓國', cities: ['Seoul', 'Busan', 'Jeju Island', 'Incheon'] },
  { country: '泰國', cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya'] },
  { country: '台灣', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan'] },
  { country: '其他', cities: ['Hong Kong', 'Singapore', 'Kuala Lumpur', 'Manila', 'Bali'] }
];

// Get weather search URL for different providers
const getWeatherSearchUrl = (city: string): { url: string; provider: string } => {
  const encoded = encodeURIComponent(city);
  return {
    url: `https://www.google.com/search?q=${encoded}+weather`,
    provider: 'Google'
  };
};

// Mock weather data for different locations
const getWeatherForLocation = (destination: string): WeatherData & { rainPeriods?: { start: string; end: string; chance: number }[], location: string } => {
  const lowerDest = destination.toLowerCase();
  
  if (lowerDest.includes('da nang') || lowerDest.includes('vietnam') || lowerDest.includes('hanoi') || lowerDest.includes('ho chi minh')) {
    return {
      location: destination.split(',')[0] || '越南',
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
  
  if (lowerDest.includes('tokyo') || lowerDest.includes('japan') || lowerDest.includes('osaka') || lowerDest.includes('kyoto')) {
    return {
      location: destination.split(',')[0] || '日本',
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

  if (lowerDest.includes('seoul') || lowerDest.includes('korea') || lowerDest.includes('busan')) {
    return {
      location: destination.split(',')[0] || '韓國',
      temperature: 18,
      condition: 'cloudy',
      humidity: 60,
      high: 22,
      low: 14,
      rainPeriods: [],
      hourlyForecast: [
        { hour: '現在', temperature: 18, condition: 'cloudy' },
        { hour: '14:00', temperature: 20, condition: 'partly-cloudy' },
        { hour: '15:00', temperature: 22, condition: 'sunny' },
        { hour: '16:00', temperature: 21, condition: 'sunny' },
        { hour: '17:00', temperature: 19, condition: 'partly-cloudy' },
        { hour: '18:00', temperature: 17, condition: 'cloudy' },
        { hour: '19:00', temperature: 15, condition: 'cloudy' },
      ]
    };
  }

  if (lowerDest.includes('bangkok') || lowerDest.includes('thailand') || lowerDest.includes('phuket')) {
    return {
      location: destination.split(',')[0] || '泰國',
      temperature: 33,
      condition: 'sunny',
      humidity: 75,
      high: 35,
      low: 28,
      rainPeriods: [
        { start: '16:00', end: '17:00', chance: 30 }
      ],
      hourlyForecast: [
        { hour: '現在', temperature: 33, condition: 'sunny' },
        { hour: '14:00', temperature: 34, condition: 'sunny' },
        { hour: '15:00', temperature: 35, condition: 'partly-cloudy' },
        { hour: '16:00', temperature: 33, condition: 'cloudy' },
        { hour: '17:00', temperature: 31, condition: 'partly-cloudy' },
        { hour: '18:00', temperature: 30, condition: 'sunny' },
        { hour: '19:00', temperature: 29, condition: 'sunny' },
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
  const [selectedCity, setSelectedCity] = useState(destination);
  const [weather, setWeather] = useState(getWeatherForLocation(destination));
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setSelectedCity(destination);
    setWeather(getWeatherForLocation(destination));
  }, [destination]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setWeather(getWeatherForLocation(city));
    setIsOpen(false);
    setSearchQuery('');
  };

  const weatherInfo = getWeatherSearchUrl(selectedCity);
  
  const Icon = conditionIcons[weather.condition];
  const hasRain = weather.condition === 'rainy' || weather.condition === 'stormy' || 
    weather.hourlyForecast.some(h => h.condition === 'rainy' || h.condition === 'stormy');

  // Filter cities based on search
  const filteredLocations = searchQuery 
    ? popularLocations.map(loc => ({
        ...loc,
        cities: loc.cities.filter(city => 
          city.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(loc => loc.cities.length > 0)
    : popularLocations;

  return (
    <div className={`bg-gradient-to-br ${conditionBg[weather.condition]} rounded-2xl p-5 shadow-card overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-3.5 h-3.5" />
                {weather.location}天氣
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-3 border-b border-border">
                <Input
                  placeholder="搜尋城市..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredLocations.map((loc) => (
                  <div key={loc.country} className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">{loc.country}</p>
                    <div className="flex flex-wrap gap-1">
                      {loc.cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleSelectCity(city)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            selectedCity.toLowerCase().includes(city.toLowerCase())
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
      
      {/* Global Weather Search Link */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <a 
          href={weatherInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Globe className="w-3 h-3" />
          <span>在 {weatherInfo.provider} 查看 {selectedCity} 詳細天氣</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};