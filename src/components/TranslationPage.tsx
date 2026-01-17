import { useState, useEffect } from 'react';
import { ArrowRightLeft, Mic, Camera, Copy, Volume2, Check, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFavoritePhrases, addFavoritePhrase, removeFavoritePhrase, isFavoritePhrase, FavoritePhrase } from '@/lib/favorites';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const languages = [
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-HK', name: '廣東話', flag: '🇭🇰' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

// Simple phrase translations for demo
const phrases: Record<string, Record<string, string>> = {
  'zh-TW': {
    '你好': 'Xin chào',
    '謝謝': 'Cảm ơn',
    '多少錢': 'Bao nhiêu tiền?',
    '太貴了': 'Đắt quá',
    '好吃': 'Ngon',
    '洗手間在哪裡': 'Nhà vệ sinh ở đâu?',
    '我要這個': 'Tôi muốn cái này',
    '不要': 'Không',
    '可以': 'Được',
    '幫助': 'Giúp đỡ',
  }
};

// Google TTS function
const speakWithGoogleTTS = (text: string, lang: string) => {
  if (!text) return;
  
  // Map language codes to Google TTS format
  const langMap: Record<string, string> = {
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-HK',
    'vi': 'vi',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'th': 'th',
  };
  
  const ttsLang = langMap[lang] || lang;
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${ttsLang}&client=tw-ob`;
  
  const audio = new Audio(url);
  audio.play().catch(() => {
    // Fallback to Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  });
};

export const TranslationPage = () => {
  const [sourceLang, setSourceLang] = useState('zh-TW');
  const [targetLang, setTargetLang] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([]);
  const [activeTab, setActiveTab] = useState('translate');

  useEffect(() => {
    setFavorites(getFavoritePhrases());
  }, []);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          text: sourceText.trim(),
          sourceLang,
          targetLang,
        },
      });

      if (error) throw error;
      
      if (data?.translatedText) {
        setTranslatedText(data.translatedText);
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('翻譯失敗，請稍後再試');
      // Fallback to phrasebook
      const phrasebook = phrases[sourceLang];
      if (phrasebook && phrasebook[sourceText.trim()]) {
        setTranslatedText(phrasebook[sourceText.trim()]);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('您的瀏覽器不支援語音識別');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = sourceLang;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSourceText(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('語音識別失敗，請再試一次');
    };
    
    recognition.start();
  };

  const handleSpeak = (text: string, lang: string) => {
    speakWithGoogleTTS(text, lang);
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('已複製到剪貼簿');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;
    
    const existingFavorite = favorites.find(
      f => f.sourceText === sourceText.trim() && f.targetLang === targetLang
    );
    
    if (existingFavorite) {
      const updated = removeFavoritePhrase(existingFavorite.id);
      setFavorites(updated);
      toast.success('已移除收藏');
    } else {
      addFavoritePhrase({
        sourceText: sourceText.trim(),
        translatedText: translatedText.trim(),
        sourceLang,
        targetLang,
      });
      setFavorites(getFavoritePhrases());
      toast.success('已加入收藏');
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = removeFavoritePhrase(id);
    setFavorites(updated);
    toast.success('已移除收藏');
  };

  const handleUseFavorite = (phrase: FavoritePhrase) => {
    setSourceLang(phrase.sourceLang);
    setTargetLang(phrase.targetLang);
    setSourceText(phrase.sourceText);
    setTranslatedText(phrase.translatedText);
    setActiveTab('translate');
  };

  const isFavorited = sourceText.trim() && translatedText.trim() && 
    favorites.some(f => f.sourceText === sourceText.trim() && f.targetLang === targetLang);

  const sourceLanguage = languages.find(l => l.code === sourceLang);
  const targetLanguage = languages.find(l => l.code === targetLang);

  return (
    <div className="min-h-screen pb-20">
      {/* Header with language selectors */}
      <div className="bg-gradient-tropical p-4 pt-safe">
        <div className="flex items-center justify-between gap-2">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="flex-1 bg-card/90 border-0">
              <SelectValue>
                <span>{sourceLanguage?.flag} {sourceLanguage?.name}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map(l => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSwapLanguages}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
          
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="flex-1 bg-card/90 border-0">
              <SelectValue>
                <span>{targetLanguage?.flag} {targetLanguage?.name}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map(l => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0">
            <TabsTrigger 
              value="translate" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              翻譯
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              收藏 ({favorites.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="translate" className="mt-0">
          {/* Dual view translation panels */}
          <div className="flex flex-col">
            {/* Target panel (output) */}
            <div className="bg-muted/30 p-4 min-h-[160px] border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {targetLanguage?.flag} {targetLanguage?.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    disabled={!translatedText}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleCopy(translatedText)}
                    disabled={!translatedText}
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={!sourceText.trim() || !translatedText.trim()}
                  >
                    <Star className={`w-4 h-4 ${isFavorited ? 'fill-secondary text-secondary' : ''}`} />
                  </Button>
                </div>
              </div>
              <p className="text-lg text-foreground whitespace-pre-wrap">
                {translatedText || 'Kết quả dịch sẽ hiển thị ở đây...'}
              </p>
            </div>

            {/* Source panel (input) */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {sourceLanguage?.flag} {sourceLanguage?.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleVoiceInput}
                    className={isListening ? 'text-accent animate-pulse' : ''}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="輸入要翻譯的文字..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[120px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-lg"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || isTranslating}
                  className="bg-gradient-tropical hover:opacity-90"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      翻譯中...
                    </>
                  ) : (
                    '翻譯'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Phrases */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">常用語句</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(phrases['zh-TW'] || {}).slice(0, 8).map(([zh, vi]) => (
                <button
                  key={zh}
                  onClick={() => {
                    setSourceText(zh);
                    setTranslatedText(vi);
                  }}
                  className="bg-card rounded-xl p-3 text-left shadow-card hover:shadow-hover transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{zh}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(vi, 'vi');
                      }}
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-primary mt-0.5">{vi}</p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-0 p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>還沒有收藏的語句</p>
              <p className="text-sm mt-1">翻譯後點擊星號收藏</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((phrase) => {
                const srcLang = languages.find(l => l.code === phrase.sourceLang);
                const tgtLang = languages.find(l => l.code === phrase.targetLang);
                return (
                  <div
                    key={phrase.id}
                    className="bg-card rounded-xl p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{srcLang?.flag} {srcLang?.name}</span>
                          <span>→</span>
                          <span>{tgtLang?.flag} {tgtLang?.name}</span>
                        </div>
                        <button
                          onClick={() => handleUseFavorite(phrase)}
                          className="text-left w-full"
                        >
                          <p className="font-medium text-foreground">{phrase.sourceText}</p>
                          <p className="text-primary mt-1">{phrase.translatedText}</p>
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSpeak(phrase.translatedText, phrase.targetLang)}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFavorite(phrase.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
