import { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  label: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ targetDate, label }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[52px] shadow-card">
        <span className="text-2xl font-bold text-card-foreground tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs mt-1 text-primary-foreground/80 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-tropical rounded-2xl p-5 shadow-glow">
      <div className="flex items-center gap-2 mb-3">
        <Plane className="w-5 h-5 text-primary-foreground" />
        <span className="text-primary-foreground font-semibold">{label}</span>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <TimeUnit value={timeLeft.days} label="日" />
        <span className="text-2xl font-bold text-primary-foreground/60">:</span>
        <TimeUnit value={timeLeft.hours} label="時" />
        <span className="text-2xl font-bold text-primary-foreground/60">:</span>
        <TimeUnit value={timeLeft.minutes} label="分" />
        <span className="text-2xl font-bold text-primary-foreground/60">:</span>
        <TimeUnit value={timeLeft.seconds} label="秒" />
      </div>
    </div>
  );
};
