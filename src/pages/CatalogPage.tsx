import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useGetProductsQuery } from '@/store/api';
import type { Product } from '@/types';

const LIMIT = 12;

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

function getPaginationItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 'ellipsis-end', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [targetPage, setTargetPage] = useState('1');
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery({
    page,
    limit: LIMIT,
  });

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);
  const paginationItems = useMemo(
    () => getPaginationItems(page, totalPages),
    [page, totalPages],
  );

  const changePage = (nextPage: number) => {
    if (isFetching || nextPage === page || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
    setTargetPage(String(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTargetPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextPage = Number(targetPage);

    if (!Number.isInteger(nextPage)) {
      setTargetPage(String(page));
      return;
    }

    changePage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <>
      <div className="hidden gap-5 md:grid">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] leading-10 font-bold">УСЫ</h1>
          <CatalogControls />
        </div>

        <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
          <DesktopFilters />

          <section className="grid content-start gap-2">
            {isError ? (
              <ErrorPanel onRetry={() => refetch()} />
            ) : (
              <>
                <ProductPanel isLoading={isLoading} isFetching={isFetching} products={products} />

                {totalPages > 1 ? (
                  <CatalogPagination
                    isFetching={isFetching}
                    items={paginationItems}
                    onPageChange={changePage}
                    onTargetPageChange={setTargetPage}
                    onTargetPageSubmit={submitTargetPage}
                    page={page}
                    targetPage={targetPage}
                    totalPages={totalPages}
                  />
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>

      <section className="grid gap-3 md:hidden">
        <form className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-card px-2.5">
          <Icon name="search" size={16} className="text-muted-foreground" />
          <input className="min-w-0 flex-1 bg-transparent text-base leading-6 outline-none placeholder:text-muted-foreground" placeholder="Искать" />
        </form>

        {isError ? (
          <ErrorPanel onRetry={() => refetch()} />
        ) : (
          <>
            <div className={cn('grid grid-cols-2 gap-x-1 gap-y-2', isFetching && !isLoading && 'opacity-60')}>
              {isLoading
                ? Array.from({ length: LIMIT }, (_, index) => <CatalogProductSkeleton key={index} />)
                : products.map((product) => (
                    <CatalogProductCard key={product.id} product={product} compact imageClassName="h-[172px]" />
                  ))}
            </div>

            {totalPages > 1 ? (
              <CatalogPagination
                className="pt-2"
                isFetching={isFetching}
                items={paginationItems}
                onPageChange={changePage}
                onTargetPageChange={setTargetPage}
                onTargetPageSubmit={submitTargetPage}
                page={page}
                targetPage={targetPage}
                totalPages={totalPages}
              />
            ) : null}
          </>
        )}
      </section>
    </>
  );
}

function CatalogControls() {
  return (
    <div className="flex gap-2">
      {['Сортировка', 'Отображение'].map((label) => (
        <button key={label} className="flex h-8 min-w-[140px] items-center justify-between rounded border border-muted-foreground bg-background px-3 text-base leading-6">
          {label}
          <span className="text-2xl leading-none text-muted-foreground">⌄</span>
        </button>
      ))}
    </div>
  );
}

function DesktopFilters() {
  return (
    <aside className="grid content-start gap-6 rounded-lg bg-card px-6 py-7 shadow-card">
      <section className="grid gap-1 text-base leading-6">
        <h2 className="mb-1 text-sm leading-5 font-bold">Категория</h2>
        {['Классические', 'Исторические', 'Театральные', 'Экспериментальные', 'Экзотические', 'Современные'].map((item) => (
          <button key={item} className="h-7 text-left text-sm leading-5">
            {item}
          </button>
        ))}
      </section>

      <DesktopCheckboxGroup title="Стиль" items={['Деловой', 'Винтаж', 'Театральный', 'Экспериментальный', 'Военный']} />
      <DesktopRadioGroup title="Густота" items={['Низкая', 'Средняя', 'Высокая']} />

      <section className="grid gap-3">
        <h2 className="text-sm leading-5 font-bold">Фильтр</h2>
        <SwitchRow label="требует укладки воском" />
        <SwitchRow label="повышает харизму" />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm leading-5 font-bold">Цена</h2>
        <div className="grid grid-cols-2 gap-2">
          <input className="h-10 rounded border border-muted-foreground bg-background px-3" defaultValue="10" />
          <input className="h-10 rounded border border-muted-foreground bg-background px-3" defaultValue="1000" />
        </div>
        <Button variant="secondary" className="h-10 w-full">
          Очистить фильтры
        </Button>
      </section>
    </aside>
  );
}

function ProductPanel({ isLoading, isFetching, products }: { isLoading: boolean; isFetching: boolean; products: Product[] }) {
  return (
    <div className={cn('rounded-lg bg-card p-6 shadow-card', isFetching && !isLoading && 'opacity-60')}>
      <div className="grid gap-x-4 gap-y-10 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: LIMIT }, (_, index) => <CatalogProductSkeleton key={index} />)
          : products.map((product) => (
              <CatalogProductCard key={product.id} product={product} imageClassName="h-[160px]" />
            ))}
      </div>
    </div>
  );
}

function CatalogProductCard({ product, imageClassName, compact = false }: { product: Product; imageClassName: string; compact?: boolean }) {
  return (
    <article className={cn('grid min-w-0 content-start', compact ? 'gap-1' : 'gap-2')}>
      <Link to={`/products/${product.id}`} className={cn('block overflow-hidden bg-card', imageClassName)}>
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain" />
      </Link>
      <div className="grid gap-1">
        <Link to={`/products/${product.id}`} className="truncate text-sm leading-5 md:text-base md:leading-6">
          {product.name}
        </Link>
        <span className="text-xl leading-5 font-bold text-success">{currency.format(product.price)}</span>
      </div>
      <Button className="h-10 w-full" variant="iconPrimary" aria-label={`Добавить в корзину: ${product.name}`} disabled={!product.inStock}>
        <Icon name="shoppingBag" />
      </Button>
    </article>
  );
}

function CatalogPagination({
  className,
  isFetching,
  items,
  onPageChange,
  onTargetPageChange,
  onTargetPageSubmit,
  page,
  targetPage,
  totalPages,
}: {
  className?: string;
  isFetching: boolean;
  items: PageItem[];
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
        className="grid h-6 w-7 place-items-center rounded border border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        disabled={isFetching || page === 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="size-4" />
      </button>

      {items.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            className={cn(
              'grid h-6 min-w-6 place-items-center rounded px-2 transition-colors hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-50',
              item === page && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            )}
            disabled={isFetching}
            onClick={() => onPageChange(item)}
            type="button"
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="grid h-6 min-w-4 place-items-center text-muted-foreground">
            ...
          </span>
        ),
      )}

      <button
        className="grid h-6 w-7 place-items-center rounded border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        disabled={isFetching || page === totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
        aria-label="Следующая страница"
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

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
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

function CatalogProductSkeleton() {
  return (
    <div className="grid content-start gap-2">
      <div className="h-[160px] animate-pulse rounded bg-muted" />
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      <div className="h-10 animate-pulse rounded bg-muted" />
    </div>
  );
}

function DesktopCheckboxGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-sm leading-5 font-bold">{title}</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
            <span className="size-4 rounded-sm border border-muted-foreground bg-background" />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function DesktopRadioGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-sm leading-5 font-bold">{title}</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
            <span className="size-4 rounded-full border border-muted-foreground bg-background" />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function SwitchRow({ label }: { label: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-sm leading-5">
      <span className="h-5 w-10 rounded-full bg-muted-foreground/60 p-0.5">
        <span className="block size-4 rounded-full bg-card" />
      </span>
      {label}
    </label>
  );
}
