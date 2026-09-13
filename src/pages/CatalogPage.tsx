import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProductControls } from '@/components/app/ProductControls';
import { productSortOptions } from '@/components/app/productControlsConfig';
import type { ProductSortValue, ProductViewMode } from '@/components/app/productControlsConfig';
import { Button, Icon } from '@/components/ui';
import { useAddProductToCart } from '@/hooks/useAddProductToCart';
import { cn } from '@/lib/utils';
import { useGetProductsQuery } from '@/store/api';
import type { FilterState } from '@/store/api';
import { selectCartItemQuantity } from '@/store/cartSlice';
import type { Product } from '@/types';

const LIMIT = 12;
const FILTER_DEBOUNCE_MS = 350;
const categories = ['Классические', 'Исторические', 'Театральные', 'Экспериментальные', 'Экзотические', 'Современные'];
const styles = ['Классический', 'Винтаж', 'Театральный', 'Экспериментальный', 'Военный', 'Минимализм', 'Экзотический'];
const densities = ['Низкая', 'Средняя', 'Высокая'];
const initialFilters: FilterState = {
  page: 1,
  limit: LIMIT,
  category: null,
  styles: [],
  density: null,
  requiresWax: null,
  boostsCharisma: null,
  minPrice: '',
  maxPrice: '',
  sortBy: null,
  order: null,
};

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
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [queryFilters, setQueryFilters] = useState<FilterState>(initialFilters);
  const [targetPage, setTargetPage] = useState('1');
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid');
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryFilters);

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / LIMIT);
  const page = queryFilters.page;
  const selectedSort = productSortOptions.find((option) => option.sortBy === filters.sortBy && option.order === filters.order)?.value ?? 'popular';
  const paginationItems = useMemo(
    () => getPaginationItems(page, totalPages),
    [page, totalPages],
  );

  const scheduleQueryFiltersUpdate = useCallback((nextFilters: FilterState) => {
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = setTimeout(() => {
      setQueryFilters(nextFilters);
      filterDebounceRef.current = null;
    }, FILTER_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
  }, []);

  const changePage = (nextPage: number) => {
    if (isFetching || nextPage === page || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
      filterDebounceRef.current = null;
    }

    const nextFilters = { ...filters, page: nextPage };

    setFilters(nextFilters);
    setQueryFilters(nextFilters);
    setTargetPage(String(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilters = (nextFilters: Partial<FilterState>) => {
    const updatedFilters = {
      ...filters,
      ...nextFilters,
      page: 1,
    };

    setFilters(updatedFilters);
    setTargetPage('1');
    scheduleQueryFiltersUpdate(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    updateFilters({
      category: filters.category === category ? null : category,
    });
  };

  const toggleStyle = (style: string) => {
    updateFilters({
      styles: filters.styles.includes(style)
        ? filters.styles.filter((item) => item !== style)
        : [...filters.styles, style],
    });
  };

  const toggleBooleanFilter = (name: 'requiresWax' | 'boostsCharisma') => {
    updateFilters({
      [name]: filters[name] === true ? null : true,
    });
  };

  const changeSort = (value: ProductSortValue) => {
    const sortOption = productSortOptions.find((option) => option.value === value) ?? productSortOptions[0];

    updateFilters({
      sortBy: sortOption.sortBy,
      order: sortOption.order,
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    scheduleQueryFiltersUpdate(initialFilters);
    setTargetPage('1');
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
          <ProductControls
            onSortChange={changeSort}
            onViewChange={setViewMode}
            selectedSort={selectedSort}
            selectedView={viewMode}
          />
        </div>

        <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
          <DesktopFilters
            filters={filters}
            onCategoryToggle={toggleCategory}
            onClear={clearFilters}
            onDensityChange={(density) => updateFilters({ density })}
            onMaxPriceChange={(maxPrice) => updateFilters({ maxPrice })}
            onMinPriceChange={(minPrice) => updateFilters({ minPrice })}
            onStyleToggle={toggleStyle}
            onToggleBoolean={toggleBooleanFilter}
          />

          <section className="grid content-start gap-2">
            {isError ? (
              <ErrorPanel onRetry={() => refetch()} />
            ) : (
              <>
                <ProductPanel isLoading={isLoading} isFetching={isFetching} products={products} viewMode={viewMode} />

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
            {isLoading || products.length > 0 ? (
              <div className={cn('grid grid-cols-2 gap-x-1 gap-y-2', isFetching && !isLoading && 'opacity-60')}>
                {isLoading
                  ? Array.from({ length: LIMIT }, (_, index) => <CatalogProductSkeleton key={index} />)
                  : products.map((product) => (
                      <CatalogProductCard key={product.id} product={product} compact imageClassName="h-[172px]" viewMode="grid" />
                    ))}
              </div>
            ) : (
              <div className="grid min-h-[240px] place-items-center rounded-lg bg-card p-5 text-center text-muted-foreground shadow-card">
                По выбранным фильтрам ничего не найдено
              </div>
            )}

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

function DesktopFilters({
  filters,
  onCategoryToggle,
  onClear,
  onDensityChange,
  onMaxPriceChange,
  onMinPriceChange,
  onStyleToggle,
  onToggleBoolean,
}: {
  filters: FilterState;
  onCategoryToggle: (category: string) => void;
  onClear: () => void;
  onDensityChange: (density: string | null) => void;
  onMaxPriceChange: (price: string) => void;
  onMinPriceChange: (price: string) => void;
  onStyleToggle: (style: string) => void;
  onToggleBoolean: (name: 'requiresWax' | 'boostsCharisma') => void;
}) {
  return (
    <aside className="grid content-start gap-6 rounded-lg bg-card px-6 py-7 shadow-card">
      <section className="grid gap-1 text-base leading-6">
        <h2 className="mb-1 text-sm leading-5 font-bold">Категория</h2>
        {categories.map((item) => (
          <button
            key={item}
            className={cn(
              'h-7 rounded px-2 text-left text-sm leading-5 transition-colors hover:bg-muted hover:text-primary',
              filters.category === item && 'bg-muted font-bold text-primary',
            )}
            onClick={() => onCategoryToggle(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </section>

      <DesktopCheckboxGroup
        checked={filters.styles}
        items={styles}
        onToggle={onStyleToggle}
        title="Стиль"
      />
      <DesktopRadioGroup
        checked={filters.density}
        items={densities}
        onChange={onDensityChange}
        title="Густота"
      />

      <section className="grid gap-3">
        <h2 className="text-sm leading-5 font-bold">Фильтр</h2>
        <SwitchRow
          checked={filters.requiresWax === true}
          label="требует укладки воском"
          onToggle={() => onToggleBoolean('requiresWax')}
        />
        <SwitchRow
          checked={filters.boostsCharisma === true}
          label="повышает харизму"
          onToggle={() => onToggleBoolean('boostsCharisma')}
        />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm leading-5 font-bold">Цена</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Минимальная цена"
            className="h-10 rounded border border-muted-foreground bg-background px-3"
            inputMode="numeric"
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder="10"
            value={filters.minPrice}
          />
          <input
            aria-label="Максимальная цена"
            className="h-10 rounded border border-muted-foreground bg-background px-3"
            inputMode="numeric"
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder="1000"
            value={filters.maxPrice}
          />
        </div>
        <Button onClick={onClear} type="button" variant="secondary" className="h-10 w-full">
          Очистить фильтры
        </Button>
      </section>
    </aside>
  );
}

function ProductPanel({
  isLoading,
  isFetching,
  products,
  viewMode,
}: {
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
            ? Array.from({ length: LIMIT }, (_, index) => <CatalogProductSkeleton key={index} />)
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

function CatalogProductCard({
  product,
  imageClassName,
  compact = false,
  viewMode,
}: {
  product: Product;
  imageClassName: string;
  compact?: boolean;
  viewMode: ProductViewMode;
}) {
  const quantity = useSelector(selectCartItemQuantity(product.id));
  const { addProductToCart, isAddingToCart } = useAddProductToCart();

  if (viewMode === 'list') {
    return (
      <article className="grid min-w-0 gap-4 border-b border-border py-5 last:border-b-0 md:grid-cols-[96px_minmax(0,1fr)_160px] md:items-center">
        <Link to={`/products/${product.id}`} className="block h-16 overflow-hidden bg-card">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain" />
        </Link>
        <div className="grid min-w-0 gap-2">
          <Link to={`/products/${product.id}`} className="text-base leading-6 text-primary">
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{product.description}</p>
        </div>
        <div className="grid gap-3 md:justify-items-end">
          <span className="text-xl leading-5 font-bold">{currency.format(product.price)}</span>
          <Button
            className="h-10 w-full md:w-36"
            variant="iconPrimary"
            aria-label={`Добавить в корзину: ${product.name}`}
            disabled={!product.inStock || isAddingToCart}
            onClick={() => void addProductToCart(product.id)}
          >
            {quantity > 0 ? <span>{quantity}</span> : <Icon name="shoppingBag" />}
          </Button>
        </div>
      </article>
    );
  }

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
      <Button
        className="h-10 w-full"
        variant="iconPrimary"
        aria-label={`Добавить в корзину: ${product.name}`}
        disabled={!product.inStock || isAddingToCart}
        onClick={() => void addProductToCart(product.id)}
      >
        {quantity > 0 ? <span>{quantity}</span> : <Icon name="shoppingBag" />}
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

function DesktopCheckboxGroup({
  checked,
  items,
  onToggle,
  title,
}: {
  checked: string[];
  items: string[];
  onToggle: (item: string) => void;
  title: string;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-sm leading-5 font-bold">{title}</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
            <input
              checked={checked.includes(item)}
              className="size-4 shrink-0 appearance-none rounded-sm border border-muted-foreground bg-background checked:border-primary checked:bg-primary"
              onChange={() => onToggle(item)}
              type="checkbox"
            />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function DesktopRadioGroup({
  checked,
  items,
  onChange,
  title,
}: {
  checked: string | null;
  items: string[];
  onChange: (item: string | null) => void;
  title: string;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-sm leading-5 font-bold">{title}</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
            <input
              checked={checked === item}
              className="size-4 shrink-0 appearance-none rounded-full border border-muted-foreground bg-background checked:border-[5px] checked:border-primary"
              name="density"
              onChange={() => onChange(item)}
              type="radio"
            />
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function SwitchRow({ checked, label, onToggle }: { checked: boolean; label: ReactNode; onToggle: () => void }) {
  return (
    <button
      className="flex items-center gap-2 text-left text-xs leading-4"
      onClick={onToggle}
      type="button"
      aria-pressed={checked}
    >
      <span className={cn('h-5 w-10 rounded-full p-0.5 transition-colors', checked ? 'bg-primary' : 'bg-muted-foreground/60')}>
        <span className={cn('block size-4 rounded-full bg-card transition-transform', checked && 'translate-x-5')} />
      </span>
      {label}
    </button>
  );
}
