import { Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useSaveProductRatingMutation } from '@/store/api';
import type { ProductRating as ProductRatingRecord, User } from '@/types';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

export function ProductRating({ canRate, productId, ratings, user }: {
  canRate: boolean;
  productId: string;
  ratings: ProductRatingRecord[];
  user: User | null;
}) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saveProductRating, { isLoading }] = useSaveProductRatingMutation();
  const savedRating = ratings.find((rating) => rating.userId === user?.id)?.rating ?? 0;

  const handleRating = async (rating: number) => {
    if (!user) return;
    setUserRating(rating);

    try {
      await saveProductRating({
        productId,
        rating,
        userName: `${user.firstName} ${user.lastName.charAt(0)}.`,
      }).unwrap();
      toast.success('Оценка сохранена');
    } catch {
      setUserRating(savedRating);
      toast.error('Не удалось сохранить оценку');
    }
  };

  return (
    <section className="mt-8 rounded-xl bg-card p-6 shadow-card md:mt-5">
      <div className="grid gap-4 md:gap-4">
        {canRate ? (
          <>
            <div className="grid gap-4 md:gap-3">
              <p className="hidden text-base leading-6 md:block">Оцените усы</p>
              <div className="flex justify-between md:w-[194px] md:justify-start md:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    aria-label={`Оценить на ${star}`}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLoading}
                    key={star}
                    onClick={() => void handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    type="button"
                  >
                    <Star className={cn('size-10 text-primary-hover md:size-8', star <= (hoverRating || userRating || savedRating) && 'fill-primary')} />
                  </button>
                ))}
              </div>
              <button
                className="h-10 cursor-pointer rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:hidden"
                disabled={isLoading || userRating === 0}
                onClick={() => void handleRating(userRating)}
                type="button"
              >
                {isLoading ? 'Сохраняем...' : 'Оценить'}
              </button>
            </div>
            <div className="border-t border-[#9ca3af] md:border-border" />
          </>
        ) : null}

        <div className="grid gap-0">
          {ratings.length > 0 ? ratings.map((rating, index) => (
            <RatingRow
              date={dateFormatter.format(new Date(rating.createdAt))}
              filled={rating.rating}
              key={`${rating.productId}-${rating.userId}`}
              last={index === ratings.length - 1}
              name={rating.userName}
              score={rating.rating}
            />
          )) : (
            <p className="text-sm leading-5 text-muted-foreground">У этого товара пока нет оценок</p>
          )}
        </div>
      </div>
    </section>
  );
}

function RatingRow({ name, date, filled, last, score }: {
  name: string;
  date: string;
  filled: number;
  last?: boolean;
  score: number;
}) {
  return (
    <div className={last ? 'py-5' : 'border-b border-[#9ca3af] py-5 md:border-border'}>
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-5 font-bold">{score.toFixed(1)}</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className={index < filled ? 'size-6 fill-primary text-primary' : 'size-6 text-primary'} key={index} />
            ))}
          </div>
        </div>
        <span className="hidden text-sm leading-5 text-muted-foreground md:block">{date}</span>
        <div className="flex items-center justify-between md:contents">
          <span className="text-base leading-6">{name}</span>
          <span className="text-sm leading-5 text-muted-foreground md:hidden">{date}</span>
        </div>
      </div>
    </div>
  );
}
