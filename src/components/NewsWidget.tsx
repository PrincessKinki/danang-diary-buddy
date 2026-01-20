import { useState } from 'react';
import { Newspaper, ChevronDown, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const countries = [
  { code: 'vn', name: '🇻🇳 越南', query: 'Vietnam', searchQuery: '越南 旅遊 新聞' },
  { code: 'tw', name: '🇹🇼 台灣', query: 'Taiwan', searchQuery: '台灣 旅遊 新聞' },
  { code: 'hk', name: '🇭🇰 香港', query: 'Hong Kong', searchQuery: '香港 新聞' },
  { code: 'jp', name: '🇯🇵 日本', query: 'Japan', searchQuery: '日本 旅遊 新聞' },
  { code: 'kr', name: '🇰🇷 韓國', query: 'Korea', searchQuery: '韓國 旅遊 新聞' },
  { code: 'th', name: '🇹🇭 泰國', query: 'Thailand', searchQuery: '泰國 旅遊 新聞' },
  { code: 'sg', name: '🇸🇬 新加坡', query: 'Singapore', searchQuery: '新加坡 旅遊 新聞' },
  { code: 'my', name: '🇲🇾 馬來西亞', query: 'Malaysia', searchQuery: '馬來西亞 旅遊 新聞' },
  { code: 'ph', name: '🇵🇭 菲律賓', query: 'Philippines', searchQuery: '菲律賓 旅遊 新聞' },
  { code: 'id', name: '🇮🇩 印尼', query: 'Indonesia', searchQuery: '印尼 峇里島 旅遊 新聞' },
];

// Sample news topics for display
const getNewsTitles = (country: string): string[] => {
  const newsMap: Record<string, string[]> = {
    'Vietnam': [
      '越南峴港旅遊業復甦強勁',
      '巴拿山纜車最新票價資訊',
      '會安古城燈籠節即將開幕',
      '峴港美食推薦：必吃海鮮',
      '越南簽證新規定說明',
    ],
    'Japan': [
      '東京櫻花季提前開放',
      '日本鐵路通票優惠方案',
      '大阪環球影城新園區',
      '京都寺廟參觀攻略',
      '北海道滑雪場雪況報告',
    ],
    'Korea': [
      '首爾地鐵新路線開通',
      '韓國K-POP演唱會資訊',
      '濟州島免簽政策延長',
      '明洞購物優惠情報',
      '釜山海雲台夏季活動',
    ],
    'Thailand': [
      '曼谷水燈節活動詳情',
      '普吉島海灘水質優良',
      '清邁古城夜市推薦',
      '泰式按摩優惠情報',
      '曼谷BTS新站開通',
    ],
    'Taiwan': [
      '台北101觀景台優惠',
      '九份老街週末活動',
      '台灣高鐵早鳥票開售',
      '夜市美食推薦清單',
      '太魯閣國家公園開放',
    ],
    'Hong Kong': [
      '香港迪士尼樂園新設施',
      '港鐵優惠票價公告',
      '維多利亞港煙花匯演',
      '蘭桂坊美食推薦',
      '香港天氣預報更新',
    ],
    'default': [
      '旅遊業復甦持續',
      '航空公司推出特價機票',
      '熱門景點人流管控',
      '當地美食節活動',
      '酒店入住率上升',
    ],
  };
  
  return newsMap[country] || newsMap['default'];
};

interface NewsWidgetProps {
  destination?: string;
}

export const NewsWidget = ({ destination = 'Vietnam' }: NewsWidgetProps) => {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const savedCountry = localStorage.getItem('news_country');
    if (savedCountry) return savedCountry;
    
    // Auto-detect from destination
    const lowerDest = destination.toLowerCase();
    for (const country of countries) {
      if (lowerDest.includes(country.query.toLowerCase())) {
        return country.query;
      }
    }
    return 'Vietnam';
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCountry = (query: string) => {
    setSelectedCountry(query);
    localStorage.setItem('news_country', query);
    setIsOpen(false);
  };

  const selectedCountryObj = countries.find(c => c.query === selectedCountry);
  const newsTitles = getNewsTitles(selectedCountry);

  const getGoogleSearchUrl = () => {
    const searchQuery = selectedCountryObj?.searchQuery || `${selectedCountry} 旅遊 新聞`;
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&hl=zh-TW&udm=50`;
  };

  const openGoogleNews = () => {
    window.open(getGoogleSearchUrl(), '_blank');
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">當地新聞</h3>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {selectedCountryObj?.name || '選擇國家'}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1" align="end">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelectCountry(country.query)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedCountry === country.query
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {country.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          來源: Google 新聞
        </p>
      </div>
      
      {/* News Preview List */}
      <div className="p-4 space-y-3">
        {newsTitles.map((title, index) => (
          <button
            key={index}
            onClick={openGoogleNews}
            className="w-full text-left p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className="flex items-start gap-3">
              <span className="text-primary font-bold text-sm">{index + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  點擊查看更多
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
      
      {/* View More Button */}
      <div className="p-4 pt-0">
        <Button 
          className="w-full bg-gradient-tropical hover:opacity-90" 
          onClick={openGoogleNews}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          在 Google 查看即時新聞
        </Button>
      </div>
    </div>
  );
};
