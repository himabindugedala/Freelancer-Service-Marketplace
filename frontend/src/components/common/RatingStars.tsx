import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  max?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  max = 5,
  interactive = false,
  size = 'md',
  onChange,
  showText = true,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starNum = i + 1;
          const isFilled = starNum <= Math.round(currentVal);

          return (
            <button
              type="button"
              key={i}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNum)}
              onMouseEnter={() => interactive && setHoverRating(starNum)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } p-0.5`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 stroke-[1.5]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-slate-700">
          {rating ? rating.toFixed(1) : 'New'}
          {count !== undefined && (
            <span className="text-slate-400 font-normal ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
};
