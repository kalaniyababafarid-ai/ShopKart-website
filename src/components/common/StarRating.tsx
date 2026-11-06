import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  showNumber = false,
  reviewCount,
  interactive = false,
  onChange,
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          const isHalf = !isFilled && rating >= starValue - 0.5;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
              aria-label={`${starValue} stars`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
