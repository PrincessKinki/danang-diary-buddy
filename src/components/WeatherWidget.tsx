import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun, Droplets, Wind, Umbrella, ExternalLink, Globe, ChevronDown, MapPin, Calendar, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WeatherData } from '@/types/travel';

const conditionIcons = {
  'sunny': Sun,
  'cloudy': Cloud,
  'rainy': CloudRain,
  'stormy': CloudLightning,
  'partly-cloudy': CloudSun
};

const conditionText: Record<string, string> = {
  'sunny': '晴朗',
  'cloudy': '多雲',
  'rainy': '下雨',
  'stormy': '雷暴',
  'partly-cloudy': '局部多雲'
};

const conditionBg = {
  'sunny': 'from-secondary/30 via-warning/20 to-secondary/10',
  'cloudy': 'from-muted via-muted/80 to-muted/50',
  'rainy': 'from-primary/30 via-primary/20 to-muted',
  'stormy': 'from-secondary/40 via-muted to-muted/70',
  'partly-cloudy': 'from-secondary/20 via-primary/10 to-muted/30'
};

// Countries with cities for weather
const weatherCountries = [
  { 
    code: 'vn', 
    name: '🇻🇳 越南', 
    cities: ['Da Nang', 'Hanoi', 'Ho Chi Minh City', 'Nha Trang', 'Hoi An', 'Hue', 'Phu Quoc'] 
  },
  { 
    code: 'jp', 
    name: '🇯🇵 日本', 
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Okinawa', 'Nagoya', 'Fukuoka', 'Sapporo'] 
  },
  { 
    code: 'kr', 
    name: '🇰🇷 韓國', 
    cities: ['Seoul', 'Busan', 'Jeju Island', 'Incheon', 'Daegu', 'Gyeongju'] 
  },
  { 
    code: 'th', 
    name: '🇹🇭 泰國', 
    cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui'] 
  },
  { 
    code: 'tw', 
    name: '🇹🇼 台灣', 
    cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Hualien', 'Kenting'] 
  },
  { 
    code: 'hk', 
    name: '🇭🇰 香港', 
    cities: ['Hong Kong', 'Kowloon', 'Lantau Island'] 
  },
  { 
    code: 'sg', 
    name: '🇸🇬 新加坡', 
    cities: ['Singapore', 'Sentosa'] 
  },
  { 
    code: 'my', 
    name: '🇲🇾 馬來西亞', 
    cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru', 'Malacca'] 
  },
  { 
    code: 'ph', 
    name: '🇵🇭 菲律賓', 
    cities: ['Manila', 'Cebu', 'Boracay', 'Palawan'] 
  },
  { 
    code: 'id', 
    name: '🇮🇩 印尼', 
    cities: ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok'] 
  },
];

// Get weather search URL
const getWeatherSearchUrl = (city: string): { url: string; provider: string } => {
  const encoded = encodeURIComponent(city);
  return {
    url: `https://www.google.com/search?q=${encoded}+weather`,
    provider: 'Google'
  };
};

// Mock weekly forecast
const generateWeeklyForecast = (baseCondition: string, baseTemp: number) => {
  const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
  const days = ['今天', '明天'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  
  for (let i = 2; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    days.push(`週${weekDays[date.getDay()]}`);
  }
  
  return days.map((day, idx) => ({
    day,
    condition: idx === 0 ? baseCondition : conditions[Math.floor(Math.random() * conditions.length)] as keyof typeof conditionIcons,
    high: baseTemp + Math.floor(Math.random() * 5),
    low: baseTemp - 4 - Math.floor(Math.random() * 3),
    rainChance: idx === 0 ? (baseCondition === 'rainy' ? 80 : 20) : Math.floor(Math.random() * 60)
  }));
};

// Mock weather data for different locations
const getWeatherForLocation = (destination: string): WeatherData & { 
  rainPeriods?: { start: string; end: string; chance: number }[], 
  location: string,
  cityName: string,
  wind: number,
  uvIndex: number,
  feelsLike: number,
  weeklyForecast: ReturnType<typeof generateWeeklyForecast>
} => {
  const lowerDest = destination.toLowerCase();
  
  if (lowerDest.includes('da nang') || lowerDest.includes('vietnam') || lowerDest.includes('hanoi') || lowerDest.includes('ho chi minh') || lowerDest.includes('nha trang')) {
    return {
      location: '越南',
      cityName: destination.split(',')[0] || 'Da Nang',
      temperature: 28,
      condition: 'rainy',
      humidity: 85,
      high: 32,
      low: 24,
      wind: 12,
      uvIndex: 6,
      feelsLike: 31,
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
        { hour: '20:00', temperature: 24, condition: 'rainy' },
        { hour: '21:00', temperature: 24, condition: 'cloudy' },
      ],
      weeklyForecast: generateWeeklyForecast('rainy', 28)
    };
  }
  
  if (lowerDest.includes('tokyo') || lowerDest.includes('japan') || lowerDest.includes('osaka') || lowerDest.includes('kyoto')) {
    return {
      location: '日本',
      cityName: destination.split(',')[0] || 'Tokyo',
      temperature: 22,
      condition: 'partly-cloudy',
      humidity: 65,
      high: 25,
      low: 18,
      wind: 8,
      uvIndex: 4,
      feelsLike: 23,
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
        { hour: '20:00', temperature: 19, condition: 'cloudy' },
        { hour: '21:00', temperature: 18, condition: 'cloudy' },
      ],
      weeklyForecast: generateWeeklyForecast('partly-cloudy', 22)
    };
  }

  if (lowerDest.includes('seoul') || lowerDest.includes('korea') || lowerDest.includes('busan') || lowerDest.includes('jeju')) {
    return {
      location: '韓國',
      cityName: destination.split(',')[0] || 'Seoul',
      temperature: 18,
      condition: 'cloudy',
      humidity: 60,
      high: 22,
      low: 14,
      wind: 15,
      uvIndex: 3,
      feelsLike: 17,
      rainPeriods: [],
      hourlyForecast: [
        { hour: '現在', temperature: 18, condition: 'cloudy' },
        { hour: '14:00', temperature: 20, condition: 'partly-cloudy' },
        { hour: '15:00', temperature: 22, condition: 'sunny' },
        { hour: '16:00', temperature: 21, condition: 'sunny' },
        { hour: '17:00', temperature: 19, condition: 'partly-cloudy' },
        { hour: '18:00', temperature: 17, condition: 'cloudy' },
        { hour: '19:00', temperature: 15, condition: 'cloudy' },
        { hour: '20:00', temperature: 14, condition: 'cloudy' },
        { hour: '21:00', temperature: 14, condition: 'cloudy' },
      ],
      weeklyForecast: generateWeeklyForecast('cloudy', 18)
    };
  }

  if (lowerDest.includes('bangkok') || lowerDest.includes('thailand') || lowerDest.includes('phuket') || lowerDest.includes('chiang mai')) {
    return {
      location: '泰國',
      cityName: destination.split(',')[0] || 'Bangkok',
      temperature: 33,
      condition: 'sunny',
      humidity: 75,
      high: 35,
      low: 28,
      wind: 6,
      uvIndex: 9,
      feelsLike: 38,
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
        { hour: '20:00', temperature: 28, condition: 'partly-cloudy' },
        { hour: '21:00', temperature: 28, condition: 'cloudy' },
      ],
      weeklyForecast: generateWeeklyForecast('sunny', 33)
    };
  }

  if (lowerDest.includes('taipei') || lowerDest.includes('taiwan') || lowerDest.includes('kaohsiung')) {
    return {
      location: '台灣',
      cityName: destination.split(',')[0] || 'Taipei',
      temperature: 26,
      condition: 'partly-cloudy',
      humidity: 70,
      high: 29,
      low: 22,
      wind: 10,
      uvIndex: 7,
      feelsLike: 28,
      rainPeriods: [],
      hourlyForecast: [
        { hour: '現在', temperature: 26, condition: 'partly-cloudy' },
        { hour: '14:00', temperature: 28, condition: 'sunny' },
        { hour: '15:00', temperature: 29, condition: 'sunny' },
        { hour: '16:00', temperature: 28, condition: 'partly-cloudy' },
        { hour: '17:00', temperature: 27, condition: 'partly-cloudy' },
        { hour: '18:00', temperature: 25, condition: 'cloudy' },
        { hour: '19:00', temperature: 24, condition: 'cloudy' },
        { hour: '20:00', temperature: 23, condition: 'cloudy' },
        { hour: '21:00', temperature: 22, condition: 'partly-cloudy' },
      ],
      weeklyForecast: generateWeeklyForecast('partly-cloudy', 26)
    };
  }
  
  // Default weather
  return {
    location: '目的地',
    cityName: destination.split(',')[0] || '未知',
    temperature: 25,
    condition: 'sunny',
    humidity: 70,
    high: 28,
    low: 22,
    wind: 8,
    uvIndex: 5,
    feelsLike: 26,
    rainPeriods: [],
    hourlyForecast: [
      { hour: '現在', temperature: 25, condition: 'sunny' },
      { hour: '14:00', temperature: 27, condition: 'sunny' },
      { hour: '15:00', temperature: 28, condition: 'sunny' },
      { hour: '16:00', temperature: 27, condition: 'partly-cloudy' },
      { hour: '17:00', temperature: 26, condition: 'partly-cloudy' },
      { hour: '18:00', temperature: 24, condition: 'cloudy' },
      { hour: '19:00', temperature: 23, condition: 'cloudy' },
      { hour: '20:00', temperature: 22, condition: 'cloudy' },
      { hour: '21:00', temperature: 22, condition: 'partly-cloudy' },
    ],
    weeklyForecast: generateWeeklyForecast('sunny', 25)
  };
};

interface WeatherWidgetProps {
  destination?: string;
  fullPage?: boolean;
}

export const WeatherWidget = ({ destination = 'Da Nang, Vietnam', fullPage = false }: WeatherWidgetProps) => {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const saved = localStorage.getItem('weather_country');
    return saved || 'vn';
  });
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = localStorage.getItem('weather_city');
    return saved || destination;
  });
  const [weather, setWeather] = useState(getWeatherForLocation(selectedCity));
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const weatherData = getWeatherForLocation(selectedCity);
    setWeather(weatherData);
  }, [selectedCity]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem('weather_city', city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('weather_country', countryCode);
    const country = weatherCountries.find(c => c.code === countryCode);
    if (country && country.cities.length > 0) {
      handleSelectCity(country.cities[0]);
    }
  };

  const weatherInfo = getWeatherSearchUrl(selectedCity);
  const Icon = conditionIcons[weather.condition];
  const hasRain = weather.condition === 'rainy' || weather.condition === 'stormy' || 
    weather.hourlyForecast.some(h => h.condition === 'rainy' || h.condition === 'stormy');

  const currentCountry = weatherCountries.find(c => c.code === selectedCountry);

  // Filter cities based on search
  const filteredCountries = searchQuery 
    ? weatherCountries.map(country => ({
        ...country,
        cities: country.cities.filter(city => 
          city.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(country => country.cities.length > 0)
    : weatherCountries;

  if (fullPage) {
    return (
      <div className="space-y-4">
        {/* Location Selector - Google Style */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{weather.cityName}</p>
                    <p className="text-sm text-muted-foreground">{weather.location}</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b border-border">
                <Input
                  placeholder="搜尋城市..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              <ScrollArea className="h-80">
                <div className="p-2">
                  {filteredCountries.map((country) => (
                    <div key={country.code} className="mb-3">
                      <button
                        onClick={() => handleSelectCountry(country.code)}
                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedCountry === country.code
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {country.name}
                      </button>
                      <div className="flex flex-wrap gap-1 mt-1 px-2">
                        {country.cities.map((city) => (
                          <button
                            key={city}
                            onClick={() => handleSelectCity(city)}
                            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
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
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Current Weather - Google Style */}
        <div className={`bg-gradient-to-br ${conditionBg[weather.condition]} rounded-2xl p-6 shadow-card`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-light text-foreground">{weather.temperature}</span>
                <span className="text-3xl text-muted-foreground">°C</span>
              </div>
              <p className="text-lg text-foreground mt-1">{conditionText[weather.condition]}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>最高 {weather.high}°</span>
                <span>最低 {weather.low}°</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Icon className="w-20 h-20 text-secondary drop-shadow-lg" />
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-border/30">
            <div className="text-center">
              <Thermometer className="w-5 h-5 mx-auto text-accent mb-1" />
              <p className="text-xs text-muted-foreground">體感</p>
              <p className="text-sm font-medium text-foreground">{weather.feelsLike}°</p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">濕度</p>
              <p className="text-sm font-medium text-foreground">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">風速</p>
              <p className="text-sm font-medium text-foreground">{weather.wind} km/h</p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 mx-auto text-warning mb-1" />
              <p className="text-xs text-muted-foreground">UV</p>
              <p className="text-sm font-medium text-foreground">{weather.uvIndex}</p>
            </div>
          </div>
        </div>

        {/* Rain Alert */}
        {hasRain && weather.rainPeriods && weather.rainPeriods.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Umbrella className="w-5 h-5" />
              <span className="font-medium">降雨預報</span>
            </div>
            <div className="space-y-2">
              {weather.rainPeriods.map((period, idx) => (
                <div key={idx} className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">
                    {period.start} - {period.end}
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    {period.chance}% 機率
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">逐時預報</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weather.hourlyForecast.map((hour, idx) => {
              const HourIcon = conditionIcons[hour.condition];
              const isRainy = hour.condition === 'rainy' || hour.condition === 'stormy';
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center min-w-[60px] py-3 px-3 rounded-xl ${
                    idx === 0 ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30'
                  }`}
                >
                  <span className="text-xs text-muted-foreground font-medium">{hour.hour}</span>
                  <HourIcon className={`w-6 h-6 my-2 ${isRainy ? 'text-primary' : 'text-secondary'}`} />
                  <span className="text-sm font-semibold text-foreground">{hour.temperature}°</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Forecast */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">一週預報</h3>
          </div>
          <div className="space-y-3">
            {weather.weeklyForecast.map((day, idx) => {
              const DayIcon = conditionIcons[day.condition as keyof typeof conditionIcons] || Sun;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between py-3 px-3 rounded-xl ${
                    idx === 0 ? 'bg-primary/10' : 'hover:bg-muted/30'
                  } transition-colors`}
                >
                  <span className="text-sm font-medium text-foreground w-12">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground w-8">{day.rainChance}%</span>
                  </div>
                  <DayIcon className="w-6 h-6 text-secondary" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-8 text-right">{day.high}°</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${((day.high - day.low) / 15) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{day.low}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Weather Link */}
        <a 
          href={weatherInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-card rounded-xl shadow-card text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>在 {weatherInfo.provider} 查看 {weather.cityName} 詳細天氣</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // Compact version for widget use
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
                {filteredCountries.map((country) => (
                  <div key={country.code} className="mb-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">{country.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {country.cities.map((city) => (
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
      
      {/* Rain Period Alert */}
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
        {weather.hourlyForecast.slice(0, 7).map((hour, idx) => {
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
      
      {/* Google Weather Link */}
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