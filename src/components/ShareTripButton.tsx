import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  createTrip,
  getTripInfo,
  getPlaces,
  setTripIdToURL,
  getTripIdFromURL,
} from '@/lib/storage';
import { toast } from 'sonner';

const ShareTripButton = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildUrl = (tripId: string) =>
    `${window.location.origin}${window.location.pathname}?trip=${tripId}`;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      let tripId = getTripIdFromURL();
      if (!tripId) {
        tripId = await createTrip(getTripInfo(), getPlaces());
        setTripIdToURL(tripId);
      }
      const url = buildUrl(tripId);
      setShareUrl(url);
      setOpen(true);
    } catch (e) {
      console.error('Share failed:', e);
      toast.error('分享失敗，請稍後再試');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('連結已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗，請手動複製');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        disabled={isSharing}
        className="text-primary-foreground"
        title="分享行程"
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分享你的行程</DialogTitle>
            <DialogDescription>
              將此連結傳給朋友，他們開啟後即可一起即時編輯這個行程。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly onFocus={(e) => e.target.select()} />
            <Button onClick={handleCopy} variant="secondary">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            提示：所有持有此連結的人都能檢視與編輯，請只分享給信任的對象。
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareTripButton;
