import qubyImage from '@/assets/quby-mascot.png';

interface QubyMascotProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32'
};

export const QubyMascot = ({ size = 'md', className = '', message }: QubyMascotProps) => {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {message && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card rounded-xl px-3 py-1.5 text-sm shadow-card whitespace-nowrap animate-fade-in">
          <span className="text-card-foreground">{message}</span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-card" />
        </div>
      )}
      <img 
        src={qubyImage} 
        alt="QUBY mascot" 
        className={`${sizeMap[size]} object-contain animate-bounce-gentle drop-shadow-lg`}
      />
    </div>
  );
};
