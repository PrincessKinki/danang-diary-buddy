import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, ChevronDown, RefreshCw, Globe, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceType: 'google' | 'twitter';
}

const countries = [
  { code: 'vn', name: '🇻🇳 越南', query: 'Vietnam', twitterQuery: 'Vietnam travel' },
  { code: 'tw', name: '🇹🇼 台灣', query: 'Taiwan', twitterQuery: 'Taiwan travel' },
  { code: 'hk', name: '🇭🇰 香港', query: 'Hong Kong', twitterQuery: 'Hong Kong' },
  { code: 'jp', name: '🇯🇵 日本', query: 'Japan', twitterQuery: 'Japan travel' },
  { code: 'kr', name: '🇰🇷 韓國', query: 'Korea', twitterQuery: 'Korea travel' },
  { code: 'th', name: '🇹🇭 泰國', query: 'Thailand', twitterQuery: 'Thailand travel' },
  { code: 'sg', name: '🇸🇬 新加坡', query: 'Singapore', twitterQuery: 'Singapore' },
  { code: 'my', name: '🇲🇾 馬來西亞', query: 'Malaysia', twitterQuery: 'Malaysia travel' },
  { code: 'ph', name: '🇵🇭 菲律賓', query: 'Philippines', twitterQuery: 'Philippines travel' },
  { code: 'id', name: '🇮🇩 印尼', query: 'Indonesia', twitterQuery: 'Indonesia Bali' },
];

// Mock news data with Google News and X.com sources
const getMockNews = (country: string): NewsItem[] => {
  const now = new Date();
  const baseNews: Record<string, NewsItem[]> = {
    'Vietnam': [
      { title: '越南峴港旅遊業復甦強勁，國際遊客持續增長', link: 'https://news.google.com/search?q=Da+Nang+tourism', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '峴港美食節即將開幕，匯集當地特色小吃', link: 'https://x.com/search?q=Da+Nang+food', pubDate: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '巴拿山纜車票價調整公告', link: 'https://news.google.com/search?q=Ba+Na+Hills', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '越南航空推出峴港至香港特價機票', link: 'https://x.com/search?q=Vietnam+Airlines', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '會安古城燈籠節活動詳情公佈', link: 'https://news.google.com/search?q=Hoi+An+lantern', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '峴港龍橋週末噴火時間表更新', link: 'https://x.com/search?q=Dragon+Bridge+Da+Nang', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '越南中部天氣預報：本週多雲偶有陣雨', link: 'https://news.google.com/search?q=Vietnam+weather', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '新開幕海鮮餐廳獲遊客好評', link: 'https://x.com/search?q=Da+Nang+seafood', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '峴港至胡志明市高鐵規劃進度更新', link: 'https://news.google.com/search?q=Vietnam+high+speed+rail', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '越南入境簽證新規定說明', link: 'https://news.google.com/search?q=Vietnam+visa', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
    ],
    'Japan': [
      { title: '東京櫻花季預計提前，賞花攻略大公開', link: 'https://news.google.com/search?q=Tokyo+cherry+blossom', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '日本推出外國遊客專屬鐵路通票優惠', link: 'https://x.com/search?q=JR+Pass+Japan', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '大阪環球影城新園區即將開幕', link: 'https://news.google.com/search?q=USJ+Osaka', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '京都寺廟參觀預約制度說明', link: 'https://x.com/search?q=Kyoto+temple', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '北海道滑雪場雪況報告', link: 'https://news.google.com/search?q=Hokkaido+ski', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '東京銀座百貨公司特賣會情報', link: 'https://x.com/search?q=Ginza+shopping', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '沖繩海灘水質評級公佈', link: 'https://news.google.com/search?q=Okinawa+beach', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '日本入境免稅額度調整通知', link: 'https://x.com/search?q=Japan+duty+free', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '新幹線時刻表調整公告', link: 'https://news.google.com/search?q=Shinkansen', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '富士山登山季節開放日期確定', link: 'https://news.google.com/search?q=Mount+Fuji+climbing', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
    ],
    'Korea': [
      { title: '首爾地鐵新路線開通，觀光更便利', link: 'https://news.google.com/search?q=Seoul+subway', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '韓國K-POP演唱會門票開售', link: 'https://x.com/search?q=KPOP+concert', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '濟州島免簽政策延長至年底', link: 'https://news.google.com/search?q=Jeju+visa+free', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '明洞購物街最新優惠情報', link: 'https://x.com/search?q=Myeongdong+shopping', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '釜山海雲台海灘夏季活動', link: 'https://news.google.com/search?q=Haeundae+beach', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '韓國美食節活動開始', link: 'https://x.com/search?q=Korean+food+festival', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '韓國傳統市場旅遊推薦', link: 'https://news.google.com/search?q=Korean+traditional+market', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '仁川機場快線票價優惠', link: 'https://x.com/search?q=Incheon+airport+express', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '首爾賞楓最佳地點攻略', link: 'https://news.google.com/search?q=Seoul+autumn+leaves', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '韓屋住宿體驗推薦', link: 'https://news.google.com/search?q=Hanok+stay', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
    ],
    'Thailand': [
      { title: '曼谷水燈節活動詳情公佈', link: 'https://news.google.com/search?q=Loy+Krathong+Bangkok', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '普吉島海灘水質達優良標準', link: 'https://x.com/search?q=Phuket+beach', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '清邁古城夜市新開幕', link: 'https://news.google.com/search?q=Chiang+Mai+night+market', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '泰國按摩店優惠情報', link: 'https://x.com/search?q=Thai+massage', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '曼谷BTS新站開通', link: 'https://news.google.com/search?q=Bangkok+BTS', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '泰國美食街頭小吃推薦', link: 'https://x.com/search?q=Thai+street+food', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '蘇梅島渡輪時刻表更新', link: 'https://news.google.com/search?q=Koh+Samui+ferry', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '泰國落地簽費用調整', link: 'https://x.com/search?q=Thailand+visa+on+arrival', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '芭達雅水上樂園新設施', link: 'https://news.google.com/search?q=Pattaya+water+park', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '泰國潑水節日期公佈', link: 'https://news.google.com/search?q=Songkran+festival', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
    ],
    'Taiwan': [
      { title: '台北101觀景台優惠活動', link: 'https://news.google.com/search?q=Taipei+101', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '九份老街週末活動', link: 'https://x.com/search?q=Jiufen+Taiwan', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '台灣高鐵早鳥票開售', link: 'https://news.google.com/search?q=Taiwan+High+Speed+Rail', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '夜市美食推薦清單', link: 'https://x.com/search?q=Taiwan+night+market', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '太魯閣國家公園開放資訊', link: 'https://news.google.com/search?q=Taroko+Gorge', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '日月潭遊船時刻表', link: 'https://x.com/search?q=Sun+Moon+Lake', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '墾丁海灘音樂節', link: 'https://news.google.com/search?q=Kenting+music+festival', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '台中彩虹眷村開放時間', link: 'https://x.com/search?q=Rainbow+Village+Taiwan', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '阿里山日出觀賞攻略', link: 'https://news.google.com/search?q=Alishan+sunrise', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '台北悠遊卡優惠方案', link: 'https://news.google.com/search?q=EasyCard+Taiwan', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
    ],
    'default': [
      { title: '旅遊業復甦持續，國際遊客數創新高', link: 'https://news.google.com/search?q=travel+tourism', pubDate: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '航空公司推出特價機票促銷活動', link: 'https://x.com/search?q=flight+deals', pubDate: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '熱門景點人流管控措施更新', link: 'https://news.google.com/search?q=tourist+attractions', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '當地美食節活動即將開始', link: 'https://x.com/search?q=food+festival', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '酒店入住率持續上升', link: 'https://news.google.com/search?q=hotel+booking', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '新開幕購物中心吸引大批遊客', link: 'https://x.com/search?q=shopping+mall+opening', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '天氣預報：本週天氣晴朗適合出遊', link: 'https://news.google.com/search?q=weather+forecast', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '交通運輸服務時間調整通知', link: 'https://x.com/search?q=public+transport', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 7).toISOString(), source: 'X.com', sourceType: 'twitter' },
      { title: '當地貨幣匯率波動分析', link: 'https://news.google.com/search?q=currency+exchange', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), source: 'Google News', sourceType: 'google' },
      { title: '旅遊安全提醒與注意事項', link: 'https://news.google.com/search?q=travel+safety', pubDate: new Date(now.getTime() - 1000 * 60 * 60 * 9).toISOString(), source: 'Google News', sourceType: 'google' },
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

  const openGoogleNews = () => {
    window.open(`https://news.google.com/search?q=${encodeURIComponent(selectedCountry + ' travel')}`, '_blank');
  };

  const openTwitterSearch = () => {
    const twitterQuery = selectedCountryObj?.twitterQuery || selectedCountry;
    window.open(`https://x.com/search?q=${encodeURIComponent(twitterQuery)}`, '_blank');
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
        
        {/* Source Links */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">來源:</span>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted text-xs gap-1"
            onClick={openGoogleNews}
          >
            <Globe className="w-3 h-3" />
            Google News
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted text-xs gap-1"
            onClick={openTwitterSearch}
          >
            <Twitter className="w-3 h-3" />
            X.com
          </Badge>
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
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs px-1.5 py-0 h-5 ${
                      item.sourceType === 'twitter' ? 'bg-chart-4/10 text-chart-4' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {item.sourceType === 'twitter' ? (
                      <Twitter className="w-3 h-3 mr-1" />
                    ) : (
                      <Globe className="w-3 h-3 mr-1" />
                    )}
                    {item.source}
                  </Badge>
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