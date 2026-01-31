import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTrip, getTripInfo, getPlaces, setTripIdToURL } from '@/lib/storage';

const ShareTripButton = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Get current trip data
      const tripInfo = getTripInfo();
      const places = getPlaces();
      
      // Create trip in database
      const tripId = await createTrip(tripInfo, places);
      
      // Generate shareable URL
      const shareUrl = `${window.location.origin}${window.location.pathname}?trip=${tripId}`;
      
      // Update current URL
      setTripIdToURL(tripId);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 2000);
      
      alert(`連結已複製！\n分享此連結給朋友即可一起編輯行程：\n${shareUrl}`);
    } catch (error) {
      console.error('Share failed:', error);
      alert('分享失敗，請稍後再試');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleShare}
      disabled={isSharing}
      className="text-primary-foreground"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
    </Button>
  );
};

export default ShareTripButton;
