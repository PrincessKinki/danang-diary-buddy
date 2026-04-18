import { usePresence } from '@/hooks/usePresence';
import { getTripIdFromURL } from '@/lib/storage';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PresenceIndicator = () => {
  const [tripId, setTripId] = useState<string | null>(getTripIdFromURL());

  useEffect(() => {
    const handler = () => setTripId(getTripIdFromURL());
    window.addEventListener('popstate', handler);
    window.addEventListener('trip-id-changed', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('trip-id-changed', handler);
    };
  }, []);

  const { users, cursors } = usePresence(tripId);

  if (!tripId) return null;

  return (
    <>
      {/* Floating presence pill */}
      <div className="fixed top-3 right-3 z-50 pointer-events-auto">
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border rounded-full pl-2 pr-3 py-1 shadow-card">
            <div className="flex -space-x-2">
              {users.slice(0, 4).map((u) => (
                <Tooltip key={u.userId}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.split(' ')[0]}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{u.name}</TooltipContent>
                </Tooltip>
              ))}
              {users.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +{users.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-foreground">
              {users.length} 人在線
            </span>
          </div>
        </TooltipProvider>
      </div>

      {/* Remote cursors */}
      <div className="fixed inset-0 pointer-events-none z-[60]">
        {Object.entries(cursors).map(([id, c]) => (
          <div
            key={id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${c.x}px, ${c.y}px)`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 2L17 9L10 11L7 18L3 2Z"
                fill={c.user.color}
                stroke="white"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="ml-3 -mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-white whitespace-nowrap shadow-md"
              style={{ backgroundColor: c.user.color }}
            >
              {c.user.name}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PresenceIndicator;
