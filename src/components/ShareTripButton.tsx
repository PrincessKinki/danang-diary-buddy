import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ShareTripButton = () => {
  const handleShare = () => {
    alert('分享功能開發中...');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleShare}
      className="text-primary-foreground"
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
};

export default ShareTripButton;
