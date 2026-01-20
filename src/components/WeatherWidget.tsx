import { useState } from 'react';
import { Cloud, ExternalLink, ChevronDown, MapPin, Sun, CloudRain, Thermometer, Droplets, Wind, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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

// Get Google Weather search URL
const getGoogleWeatherSearchUrl = (city: string): string => {
  const query = `今日${city}天氣`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=zh-TW`;
};

// Mock weather data for preview display
const getWeatherPreview = (city: string): { temp: number; condition: string; high: number; low: number; humidity: number } => {
  const cityLower = city.toLowerCase();
  
  if (cityLower.includes('da nang') || cityLower.includes('vietnam') || cityLower.includes('hanoi')) {
    return { temp: 28, condition: '多雲有雨', high: 32, low: 24, humidity: 85 };
  }
  if (cityLower.includes('tokyo') || cityLower.includes('japan') || cityLower.includes('osaka')) {
    return { temp: 22, condition: '局部多雲', high: 25, low: 18, humidity: 65 };
  }
  if (cityLower.includes('seoul') || cityLower.includes('korea') || cityLower.includes('busan')) {
    return { temp: 18, condition: '多雲', high: 22, low: 14, humidity: 60 };
  }
  if (cityLower.includes('bangkok') || cityLower.includes('thailand') || cityLower.includes('phuket')) {
    return { temp: 33, condition: '晴朗', high: 35, low: 28, humidity: 75 };
  }
  if (cityLower.includes('taipei') || cityLower.includes('taiwan')) {
    return { temp: 26, condition: '局部多雲', high: 29, low: 22, humidity: 70 };
  }
  if (cityLower.includes('hong kong')) {
    return { temp: 24, condition: '多雲', high: 27, low: 21, humidity: 72 };
  }
  
  return { temp: 25, condition: '晴朗', high: 28, low: 22, humidity: 70 };
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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

  const currentCountry = weatherCountries.find(c => c.code === selectedCountry);
  const weatherPreview = getWeatherPreview(selectedCity);

  // Filter cities based on search
  const filteredCountries = searchQuery 
    ? weatherCountries.map(country => ({
        ...country,
        cities: country.cities.filter(city => 
          city.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(country => country.cities.length > 0)
    : weatherCountries;

  const openGoogleWeather = () => {
    window.open(getGoogleWeatherSearchUrl(selectedCity), '_blank');
  };

  if (fullPage) {
    return (
      <div className="space-y-4">
        {/* Location Selector */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{selectedCity}</p>
                    <p className="text-sm text-muted-foreground">{currentCountry?.name}</p>
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

        {/* Weather Preview Card */}
        <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-muted rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-light text-foreground">{weatherPreview.temp}</span>
                <span className="text-3xl text-muted-foreground">°C</span>
              </div>
              <p className="text-lg text-foreground mt-1">{weatherPreview.condition}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>最高 {weatherPreview.high}°</span>
                <span>最低 {weatherPreview.low}°</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              {weatherPreview.condition.includes('雨') ? (
                <CloudRain className="w-20 h-20 text-primary drop-shadow-lg" />
              ) : weatherPreview.condition.includes('晴') ? (
                <Sun className="w-20 h-20 text-secondary drop-shadow-lg" />
              ) : (
                <Cloud className="w-20 h-20 text-muted-foreground drop-shadow-lg" />
              )}
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/30">
            <div className="text-center">
              <Thermometer className="w-5 h-5 mx-auto text-accent mb-1" />
              <p className="text-xs text-muted-foreground">體感</p>
              <p className="text-sm font-medium text-foreground">{weatherPreview.temp + 2}°</p>
            </div>
            <div className="text-center">
              <Droplets className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">濕度</p>
              <p className="text-sm font-medium text-foreground">{weatherPreview.humidity}%</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">風速</p>
              <p className="text-sm font-medium text-foreground">12 km/h</p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            以上為預估數據，點擊下方按鈕查看 Google 即時天氣
          </p>
        </div>

        {/* Open Google Weather Button */}
        <Button 
          className="w-full bg-gradient-tropical hover:opacity-90 h-14 text-lg" 
          onClick={openGoogleWeather}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          查看 Google 即時天氣
        </Button>
      </div>
    );
  }

  // Compact widget for homepage
  return (
    <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-muted rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{selectedCity}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={openGoogleWeather}
          className="h-8"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          詳情
        </Button>
      </div>
      
      <div 
        className="bg-card/80 rounded-xl p-4 cursor-pointer hover:bg-card transition-colors"
        onClick={openGoogleWeather}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-light text-foreground">{weatherPreview.temp}°C</span>
            <p className="text-sm text-muted-foreground">{weatherPreview.condition}</p>
          </div>
          {weatherPreview.condition.includes('雨') ? (
            <CloudRain className="w-10 h-10 text-primary" />
          ) : weatherPreview.condition.includes('晴') ? (
            <Sun className="w-10 h-10 text-secondary" />
          ) : (
            <Cloud className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
};
