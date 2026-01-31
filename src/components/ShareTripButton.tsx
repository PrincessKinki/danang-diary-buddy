import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createTrip, getTripInfo, getPlaces, getTripIdFromURL, setTripIdToURL } from '@/lib/storage';

const ShareTripButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const tripId = getTripIdFromURL();
      
      let finalTripId = tripId;
      
      if (!tripId) {
        const tripInfo = getTripInfo();
        const places = getPlaces();
        finalTripId = await createTrip(tripInfo, places);
        setTripIdToURL(finalTripId);
      }
      
      const url = `${window.location.origin}${window.location.pathname}?trip=${finalTripId}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('無法生成分享連結，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateShareLink}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          分享行程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分享行程給朋友</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            複製下面的連結並分享給朋友，大家就可以一起編輯同一個行程！
          </p>
          {isGenerating ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">正在生成分享連結...</p>
            </div>
          ) : shareUrl ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      複製
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ✅ 行程已保存至雲端，所有有連結的人都可以共同編輯
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTripButton;
