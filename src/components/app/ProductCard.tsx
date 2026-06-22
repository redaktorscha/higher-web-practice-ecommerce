import { Link } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  id: string;
  title: string;
  image: string;
  price: number;
  rating?: number;
  ratingCount?: number;
  inStock?: boolean;
  size?: 's' | 'm';
  layout?: 'vertical' | 'horizontal';
  className?: string;
};

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function ProductCard({
  id,
  title,
  image,
  price,
  rating = 0,
  ratingCount = 0,
  inStock = true,
  size = 'm',
  layout = 'vertical',
  className,
}: ProductCardProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg bg-card text-card-foreground shadow-card transition-shadow hover:shadow-modal',
        isHorizontal ? 'grid grid-cols-[144px_1fr] gap-4 p-4' : 'flex flex-col',
        className,
      )}
    >
      <Link to={`/products/${id}`} className={cn('block overflow-hidden rounded-md bg-muted', isHorizontal ? 'aspect-square' : size === 's' ? 'aspect-[4/3]' : 'aspect-square')}>
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
      </Link>

      <div className={cn('flex flex-1 flex-col', isHorizontal ? 'gap-3' : 'gap-4 p-4')}>
        <div className="grid gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Icon name="star" size={16} className="fill-success text-success" />
            <span>{rating.toFixed(1)}</span>
            <span>({ratingCount})</span>
          </div>
          <Link to={`/products/${id}`} className="line-clamp-2 text-base font-bold hover:text-primary">
            {title}
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="grid">
            <span className="text-xl leading-5 font-bold">{currency.format(price)}</span>
            <span className={cn('text-xs leading-4', inStock ? 'text-success' : 'text-muted-foreground')}>
              {inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>
          <Button variant="iconPrimary" aria-label="Добавить в корзину" disabled={!inStock}>
            <Icon name="shoppingBag" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export { ProductCard };
