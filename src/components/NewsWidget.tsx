import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, ChevronDown, RefreshCw, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

const countries = [
  { code: 'vn', name: '越南', query: 'Vietnam' },
  { code: 'tw', name: '台灣', query: 'Taiwan' },
  { code: 'hk', name: '香港', query: 'Hong Kong' },
  { code: 'jp', name: '日本', query: 'Japan' },
  { code: 'kr', name: '韓國', query: 'Korea' },
  { code: 'th', name: '泰國', query: 'Thailand' },
  { code: 'sg', name: '新加坡', query: 'Singapore' },
  { code: 'my', name: '馬來西亞', query: 'Malaysia' },
];

// Mock news data based on country
const getMockNews = (country: string): NewsItem[] => {
  const now = new Date();
  const baseNews: Record<string, NewsItem[]> = {
    'Vietnam': [
      { title: '越南峴港旅遊業復甦強勁，國際遊客持續增長', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'VN Express' },
      { title: '峴港美食節即將開幕，匯集當地特色小吃', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'Vietnam News' },
      { title: '巴拿山纜車票價調整公告', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Da Nang Today' },
      { title: '越南航空推出峴港至香港特價機票', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'VN Express' },
      { title: '會安古城燈籠節活動詳情公佈', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Hoi An News' },
      { title: '峴港龍橋週末噴火時間表更新', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'Da Nang Today' },
      { title: '越南中部天氣預報：本週多雲偶有陣雨', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Vietnam News' },
      { title: '新開幕海鮮餐廳獲遊客好評', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'VN Express' },
      { title: '峴港至胡志明市高鐵規劃進度更新', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Vietnam News' },
      { title: '越南入境簽證新規定說明', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Da Nang Today' },
    ],
    'Japan': [
      { title: '東京櫻花季預計提前，賞花攻略大公開', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'NHK' },
      { title: '日本推出外國遊客專屬鐵路通票', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'Japan Times' },
      { title: '大阪環球影城新園區即將開幕', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'NHK' },
      { title: '京都寺廟參觀預約制度說明', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'Kyoto News' },
      { title: '北海道滑雪場雪況報告', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Japan Times' },
      { title: '東京銀座百貨公司特賣會情報', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'NHK' },
      { title: '沖繩海灘水質評級公佈', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Okinawa Times' },
      { title: '日本入境免稅額度調整通知', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'Japan Times' },
      { title: '新幹線時刻表調整公告', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'NHK' },
      { title: '富士山登山季節開放日期確定', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Japan Times' },
    ],
    'default': [
      { title: '旅遊業復甦持續，國際遊客數創新高', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Travel News' },
      { title: '航空公司推出特價機票促銷活動', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'Aviation Daily' },
      { title: '熱門景點人流管控措施更新', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Travel News' },
      { title: '當地美食節活動即將開始', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'Food & Travel' },
      { title: '酒店入住率持續上升', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Hospitality News' },
      { title: '新開幕購物中心吸引大批遊客', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'Travel News' },
      { title: '天氣預報：本週天氣晴朗適合出遊', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Weather Daily' },
      { title: '交通運輸服務時間調整通知', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'Transport News' },
      { title: '當地貨幣匯率波動分析', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Finance Daily' },
      { title: '旅遊安全提醒與注意事項', link: '#', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Travel News' },
    ]
  };
  
  return baseNews[country] || baseNews['default'];
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else {
    return date.toLocaleDateString('zh-TW');
  }
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNews();
  }, [selectedCountry]);

  const loadNews = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setNews(getMockNews(selectedCountry));
      setIsLoading(false);
    }, 500);
  };

  const handleSelectCountry = (query: string) => {
    setSelectedCountry(query);
    localStorage.setItem('news_country', query);
    setIsOpen(false);
  };

  const selectedCountryObj = countries.find(c => c.query === selectedCountry);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">當地新聞</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadNews}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Globe className="w-3.5 h-3.5" />
                {selectedCountryObj?.name || '選擇國家'}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
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
      
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(item.pubDate)}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
