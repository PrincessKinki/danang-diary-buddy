import { useState } from 'react';
import { MapPin, ExternalLink, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TripInfo } from '@/types/travel';

interface AccommodationCardProps {
  tripInfo: TripInfo;
  onUpdate: (updates: Partial<TripInfo>) => void;
}

export const AccommodationCard = ({ tripInfo, onUpdate }: AccommodationCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(tripInfo.accommodation);

  const handleSave = () => {
    onUpdate({ accommodation: editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(tripInfo.accommodation);
    setIsEditing(false);
  };

  const openGoogleMaps = () => {
    window.open(tripInfo.accommodation.googleMapsUrl, '_blank');
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">編輯住宿資訊</h3>
        <div className="space-y-3">
          <Input
            placeholder="酒店名稱"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <Input
            placeholder="地址"
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          />
          <Input
            placeholder="Google Maps 連結"
            value={editData.googleMapsUrl}
            onChange={(e) => setEditData({ ...editData, googleMapsUrl: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              儲存
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-4 h-4 mr-1" />
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <MapPin className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">住宿地點</h3>
            <p className="font-semibold text-foreground">{tripInfo.accommodation.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tripInfo.accommodation.address}</p>
      <Button 
        onClick={openGoogleMaps}
        className="w-full bg-gradient-tropical hover:opacity-90 transition-opacity"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        在 Google Maps 開啟
      </Button>
    </div>
  );
};
