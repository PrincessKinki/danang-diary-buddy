import { useState } from 'react';
import { ArrowRightLeft, Mic, Camera, Copy, Volume2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export const TranslationPage = () => {
  const [sourceLang, setSourceLang] = useState('zh-TW');
  const [targetLang, setTargetLang] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('已複製到剪貼簿');
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* Dual view translation panels - Vietnamese on top, Chinese on bottom */}
      <div className="flex flex-col">
        {/* Target panel (Vietnamese - output) */}
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
            </div>
          </div>
          <p className="text-lg text-foreground whitespace-pre-wrap">
            {translatedText || 'Kết quả dịch sẽ hiển thị ở đây...'}
          </p>
        </div>

        {/* Source panel (Chinese - input at bottom for easy typing) */}
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
              className="bg-card rounded-xl p-3 text-left shadow-card hover:shadow-hover transition-shadow"
            >
              <p className="font-medium text-foreground">{zh}</p>
              <p className="text-sm text-primary mt-0.5">{vi}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
