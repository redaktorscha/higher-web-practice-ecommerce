import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProductCartControl } from '@/components/app/ProductCartControl';
import type { ProductViewMode } from '@/components/app/productControlsConfig';
import { Button } from '@/components/ui';
import { rubleCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { CATALOG_PAGE_SIZE, type CatalogPageItem } from './catalogConfig';

export function CatalogProducts({ isLoading, isFetching, products, viewMode }: {
  isLoading: boolean;
  isFetching: boolean;
  products: Product[];
  viewMode: ProductViewMode;
}) {
  return (
    <div className={cn('rounded-lg bg-card p-6 shadow-card', isFetching && !isLoading && 'opacity-60')}>
      {isLoading || products.length > 0 ? (
        <div className={cn('grid', viewMode === 'grid' ? 'gap-x-4 gap-y-10 md:grid-cols-4' : 'gap-0')}>
          {isLoading
            ? Array.from({ length: CATALOG_PAGE_SIZE }, (_, index) => <CatalogProductSkeleton key={index} />)
            : products.map((product) => (
                <CatalogProductCard key={product.id} product={product} imageClassName="h-[160px]" viewMode={viewMode} />
              ))}
        </div>
      ) : (
        <div className="grid min-h-[280px] place-items-center text-center text-muted-foreground">
          По выбранным фильтрам ничего не найдено
        </div>
      )}
    </div>
  );
}

export function CatalogProductCard({ product, imageClassName, compact = false, viewMode }: {
  product: Product;
  imageClassName: string;
  compact?: boolean;
  viewMode: ProductViewMode;
}) {
  if (viewMode === 'list') {
    return (
      <article className="grid min-w-0 gap-4 border-b border-border py-5 last:border-b-0 md:grid-cols-[96px_minmax(0,1fr)_160px] md:items-center">
        <Link to={`/products/${product.id}`} className="block h-16 cursor-pointer overflow-hidden bg-card">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain" />
        </Link>
        <div className="grid min-w-0 gap-2">
          <Link to={`/products/${product.id}`} className="cursor-pointer text-base leading-6 text-primary">
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{product.description}</p>
        </div>
        <div className="grid gap-3 md:justify-items-end">
          <span className="text-xl leading-5 font-bold">{rubleCurrency.format(product.price)}</span>
          <ProductCartControl className="h-10 w-full md:w-36" inStock={product.inStock} productId={product.id} productName={product.name} />
        </div>
      </article>
    );
  }

  return (
    <article className={cn('grid min-w-0 content-start', compact ? 'gap-1' : 'gap-2')}>
      <Link to={`/products/${product.id}`} className={cn('block cursor-pointer overflow-hidden bg-card', imageClassName)}>
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain" />
      </Link>
      <div className="grid gap-1">
        <Link to={`/products/${product.id}`} className="cursor-pointer truncate text-sm leading-5 md:text-base md:leading-6">
          {product.name}
        </Link>
        <span className="text-xl leading-5 font-bold text-success">{rubleCurrency.format(product.price)}</span>
      </div>
      <ProductCartControl className="h-10 w-full" inStock={product.inStock} productId={product.id} productName={product.name} />
    </article>
  );
}

export function CatalogPagination({ className, isFetching, items, onPageChange, onTargetPageChange, onTargetPageSubmit, page, targetPage, totalPages }: {
  className?: string;
  isFetching: boolean;
  items: CatalogPageItem[];
  onPageChange: (page: number) => void;
  onTargetPageChange: (page: string) => void;
  onTargetPageSubmit: (event: FormEvent<HTMLFormElement>) => void;
  page: number;
  targetPage: string;
  totalPages: number;
}) {
  return (
    <nav aria-label="Пагинация" className={cn('flex flex-wrap items-center gap-2 text-xs leading-4 text-foreground', className)}>
      <button
        aria-label="Предыдущая страница"
        className="grid h-6 w-7 cursor-pointer place-items-center rounded border border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        disabled={isFetching || page === 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft className="size-4" />
      </button>

      {items.map((item) => typeof item === 'number' ? (
        <button
          aria-current={item === page ? 'page' : undefined}
          className={cn(
            'grid h-6 min-w-6 cursor-pointer place-items-center rounded px-2 transition-colors hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-50',
            item === page && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
          )}
          disabled={isFetching}
          key={item}
          onClick={() => onPageChange(item)}
          type="button"
        >
          {item}
        </button>
      ) : (
        <span key={item} className="grid h-6 min-w-4 place-items-center text-muted-foreground">...</span>
      ))}

      <button
        aria-label="Следующая страница"
        className="grid h-6 w-7 cursor-pointer place-items-center rounded border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        disabled={isFetching || page === totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        <ChevronRight className="size-4" />
      </button>

      <form className="ml-3 flex items-center gap-2 text-muted-foreground" onSubmit={onTargetPageSubmit}>
        <input
          className="h-6 w-9 rounded border border-border bg-card px-1 text-center text-xs leading-4 text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring disabled:bg-muted"
          disabled={isFetching}
          max={totalPages}
          min={1}
          onChange={(event) => onTargetPageChange(event.target.value)}
          type="number"
          value={targetPage}
        />
        <span>Переход на страницу</span>
      </form>
    </nav>
  );
}

export function CatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-lg bg-card p-6 text-center shadow-card">
      <div className="grid max-w-[360px] gap-4">
        <h2 className="text-2xl leading-8 font-bold">Не удалось загрузить каталог</h2>
        <p className="text-muted-foreground">Проверьте, что json-server запущен, и попробуйте снова.</p>
        <Button onClick={onRetry}>Повторить</Button>
      </div>
    </div>
  );
}

export function CatalogProductSkeleton() {
  return (
    <div className="grid content-start gap-2">
      <div className="h-[160px] animate-pulse rounded bg-muted" />
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      <div className="h-10 animate-pulse rounded bg-muted" />
    </div>
  );
}
