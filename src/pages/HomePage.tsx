import { Link, useLocation, useOutletContext } from 'react-router-dom';
import type { ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProductCartControl } from '@/components/app/ProductCartControl';
import { ProductControls } from '@/components/app/ProductControls';
import { productSortOptions } from '@/components/app/productControlsConfig';
import type { ProductSortValue, ProductViewMode } from '@/components/app/productControlsConfig';
import type { MainLayoutOutletContext } from '@/components/layout/MainLayout';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useGetProductsQuery, useLazyGetProductsQuery } from '@/store/api';
import type { FilterState } from '@/store/api';
import type { Product } from '@/types';

const HOME_LIMIT = 12;
const createInitialHomeFilters = (search = ''): FilterState => ({
  page: 1,
  limit: HOME_LIMIT,
  search,
  category: null,
  styles: [],
  density: null,
  requiresWax: null,
  boostsCharisma: null,
  minPrice: '',
  maxPrice: '',
  sortBy: null,
  order: null,
});

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function HomePage() {
  const location = useLocation();
  const { registerSearchHandler, searchQuery } = useOutletContext<MainLayoutOutletContext>();
  const isCatalog = location.pathname.startsWith('/catalog');
  const isMobileFilters = location.pathname === '/catalog/filters';
  const [page, setPage] = useState(1);
  const [extraProducts, setExtraProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState(searchQuery);
  const [selectedSort, setSelectedSort] = useState<ProductSortValue>('popular');
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid');
  const desktopSentinelRef = useRef<HTMLDivElement | null>(null);
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
  const firstPageFilters = useMemo(() => {
    const sortOption = productSortOptions.find((option) => option.value === selectedSort) ?? productSortOptions[0];

    return {
      ...createInitialHomeFilters(productSearchQuery),
      sortBy: sortOption.sortBy,
      order: sortOption.order,
    };
  }, [productSearchQuery, selectedSort]);
  const {
    data: firstPageData,
    isError: isFirstPageError,
    isFetching: isFirstPageFetching,
    isLoading,
    refetch,
  } = useGetProductsQuery(firstPageFilters);
  const [loadProducts, { isError: isNextPageError, isFetching: isNextPageFetching }] = useLazyGetProductsQuery();
  const totalPages = firstPageData ? Math.ceil(firstPageData.totalCount / HOME_LIMIT) : 0;
  const products = useMemo(
    () => [...(firstPageData?.items ?? []), ...extraProducts],
    [extraProducts, firstPageData?.items],
  );
  const isError = isFirstPageError || isNextPageError;
  const isFetching = isFirstPageFetching || isNextPageFetching;
  const hasNextPage = totalPages === 0 ? false : page < totalPages;

  const loadNextPage = useCallback(async () => {
    const nextPage = page + 1;

    if (isFetching || nextPage > totalPages) {
      return;
    }

    const data = await loadProducts({
      ...firstPageFilters,
      page: nextPage,
    }).unwrap();

    setPage(nextPage);
    setExtraProducts((currentProducts) => {
      const existingIds = new Set([
        ...(firstPageData?.items ?? []).map((product) => product.id),
        ...currentProducts.map((product) => product.id),
      ]);
      const nextItems = data.items.filter((product) => !existingIds.has(product.id));

      return [...currentProducts, ...nextItems];
    });
  }, [firstPageData?.items, firstPageFilters, isFetching, loadProducts, page, totalPages]);

  useEffect(() => {
    const sentinels = [desktopSentinelRef.current, mobileSentinelRef.current].filter((sentinel): sentinel is HTMLDivElement => Boolean(sentinel));

    if (sentinels.length === 0 || !hasNextPage || isFetching) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadNextPage();
        }
      },
      { rootMargin: '240px' },
    );

    sentinels.forEach((sentinel) => observer.observe(sentinel));

    return () => observer.disconnect();
  }, [hasNextPage, isFetching, loadNextPage]);

  const applySearch = useCallback((search: string) => {
    setProductSearchQuery(search);
    setPage(1);
    setExtraProducts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => registerSearchHandler(applySearch), [applySearch, registerSearchHandler]);

  const retryFirstPage = () => {
    setPage(1);
    setExtraProducts([]);
    void refetch();
  };

  const changeSort = (value: ProductSortValue) => {
    setSelectedSort(value);
    setPage(1);
    setExtraProducts([]);
  };

  if (isMobileFilters) {
    return (
      <>
        <CatalogDesktop
          className="hidden md:grid"
          onSortChange={changeSort}
          onViewChange={setViewMode}
          products={products.slice(0, 2)}
          selectedSort={selectedSort}
          selectedView={viewMode}
        />
        <MobileFilters />
      </>
    );
  }

  if (isCatalog) {
    return (
      <>
        <CatalogDesktop
          className="hidden md:grid"
          onSortChange={changeSort}
          onViewChange={setViewMode}
          products={products.slice(0, 2)}
          selectedSort={selectedSort}
          selectedView={viewMode}
        />
        <MobileCategoryList />
      </>
    );
  }

  return (
    <>
      <HomeDesktop
        className="hidden md:grid"
        hasNextPage={hasNextPage}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        onRetry={retryFirstPage}
        products={products}
        selectedSort={selectedSort}
        selectedView={viewMode}
        sentinelRef={desktopSentinelRef}
        onSortChange={changeSort}
        onViewChange={setViewMode}
      />
      <MobileHome
        hasNextPage={hasNextPage}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        onRetry={retryFirstPage}
        products={products}
        sentinelRef={mobileSentinelRef}
      />
    </>
  );
}

function HomeDesktop({
  className,
  hasNextPage,
  isError,
  isFetching,
  isLoading,
  onRetry,
  products,
  selectedSort,
  selectedView,
  sentinelRef,
  onSortChange,
  onViewChange,
}: {
  className?: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onRetry: () => void;
  onSortChange: (value: ProductSortValue) => void;
  onViewChange: (value: ProductViewMode) => void;
  products: Product[];
  selectedSort: ProductSortValue;
  selectedView: ProductViewMode;
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className={cn('grid gap-4', className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] leading-10 font-bold">УСЫ</h1>
        <ProductControls
          onSortChange={onSortChange}
          onViewChange={onViewChange}
          selectedSort={selectedSort}
          selectedView={selectedView}
        />
      </div>
      <ProductPanel
        columns="md:grid-cols-4"
        hasNextPage={hasNextPage}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        onRetry={onRetry}
        products={products}
        sentinelRef={sentinelRef}
        viewMode={selectedView}
      />
    </section>
  );
}

function MobileHome({
  hasNextPage,
  isError,
  isFetching,
  isLoading,
  onRetry,
  products,
  sentinelRef,
}: {
  hasNextPage: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onRetry: () => void;
  products: Product[];
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="grid gap-3 md:hidden">
      <MobileSearch />
      <ProductPanel
        columns="grid-cols-2"
        hasNextPage={hasNextPage}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        onRetry={onRetry}
        products={products}
        sentinelRef={sentinelRef}
        viewMode="grid"
      />
    </section>
  );
}

function CatalogDesktop({
  className,
  onSortChange,
  onViewChange,
  products,
  selectedSort,
  selectedView,
}: {
  className?: string;
  onSortChange: (value: ProductSortValue) => void;
  onViewChange: (value: ProductViewMode) => void;
  products: Product[];
  selectedSort: ProductSortValue;
  selectedView: ProductViewMode;
}) {
  return (
    <div className={cn('grid gap-5', className)}>
      <div className="text-base leading-6 text-muted-foreground">УСЫ / Классические / Деловые</div>
      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
        <DesktopFilters />
        <section className="grid content-start gap-2">
          <div className="flex min-h-8 items-start justify-between gap-4">
            <div className="grid gap-2">
              <h1 className="text-[32px] leading-10 font-bold">Деловые</h1>
              <SelectedFilters />
            </div>
            <ProductControls
              onSortChange={onSortChange}
              onViewChange={onViewChange}
              selectedSort={selectedSort}
              selectedView={selectedView}
            />
          </div>
          <ProductPanel
            columns="md:grid-cols-4"
            hasNextPage={false}
            isError={false}
            isFetching={false}
            isLoading={products.length === 0}
            onRetry={() => undefined}
            products={products}
            sentinelRef={{ current: null }}
            viewMode={selectedView}
          />
        </section>
      </div>
    </div>
  );
}

function MobileCategoryList() {
  return (
    <section className="grid gap-5 md:hidden">
      <MobileSearch />
      <Link to="/catalog/filters" className="flex h-6 cursor-pointer items-center justify-between text-sm leading-5">
        <span>Усы</span>
        <span className="text-muted-foreground">›</span>
      </Link>
    </section>
  );
}

function MobileFilters() {
  return (
    <section className="grid gap-4 pb-0 md:hidden">
      <div className="flex h-8 items-center gap-2">
        <Link to="/catalog" aria-label="Назад" className="cursor-pointer text-[28px] leading-none">
          ←
        </Link>
        <h1 className="text-2xl leading-8 font-bold">Фильтры</h1>
      </div>

      <div className="grid gap-4">
        <FilterCard title="Цена" className="h-[122px]">
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-sm leading-5 text-muted-foreground">
              От
              <input className="h-9 w-full min-w-0 rounded border border-muted-foreground bg-background px-3 text-base text-foreground" defaultValue="10" />
            </label>
            <label className="grid gap-1 text-sm leading-5 text-muted-foreground">
              до
              <input className="h-9 w-full min-w-0 rounded border border-muted-foreground bg-background px-3 text-base text-foreground" defaultValue="400 000" />
            </label>
          </div>
        </FilterCard>

        <FilterCard
          className="h-[132px]"
          title="Стиль"
          action={
            <button className="flex cursor-pointer items-center gap-1 text-base leading-6 text-muted-foreground">
              Все <span className="text-2xl leading-none">›</span>
            </button>
          }
        >
          <div className="flex flex-wrap gap-2">
            <FilterChip active>Классический</FilterChip>
            <FilterChip>Театральный</FilterChip>
            <FilterChip>Винтаж</FilterChip>
          </div>
        </FilterCard>

        <MobileRadioGroup title="Густота" options={['Низкая', 'Высокая', 'Средняя']} active="Средняя" />
        <MobileRadioGroup title="Закрученность" options={['Низкая', 'Высокая', 'Средняя']} active="Средняя" />

        <MobileSwitchLabel>повышает харизму</MobileSwitchLabel>
        <MobileSwitchLabel>повышает харизму</MobileSwitchLabel>
      </div>

      <Button className="mt-2 h-9 w-full">Применить фильтры</Button>
    </section>
  );
}

function DesktopFilters() {
  return (
    <aside className="grid content-start gap-6 rounded-lg bg-card px-6 py-7 shadow-card">
      <section className="grid gap-1 text-base leading-6">
        <button className="h-7 cursor-pointer text-left text-primary">Все категории</button>
        <button className="h-7 cursor-pointer text-left font-bold">Классические</button>
        <button className="h-10 cursor-pointer rounded bg-muted px-4 text-left">Деловые</button>
        <button className="h-10 cursor-pointer px-4 text-left">Повседневные</button>
      </section>

      <DesktopCheckboxGroup title="Стиль" items={['Классический', 'Винтаж', 'Театральный', 'Экспериментальный', 'Минимализм', 'Военный']} checked={['Классический', 'Минимализм', 'Военный']} />
      <DesktopRadioGroup title="Густота" items={['Низкая', 'Средняя', 'Высокая']} checked="Средняя" />
      <DesktopRadioGroup title="Закрученность" items={['Низкая', 'Средняя', 'Высокая']} />

      <div className="grid gap-3">
        <SwitchRow label="требует укладки воском" />
        <SwitchRow label="повышает харизму" />
      </div>

      <section className="grid gap-3">
        <h3 className="text-base leading-6 font-bold">Цена</h3>
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

function MobileSearch() {
  return (
    <form className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-card px-2.5">
      <Icon name="search" size={16} className="text-muted-foreground" />
      <input className="min-w-0 flex-1 bg-transparent text-base leading-6 outline-none placeholder:text-muted-foreground" placeholder="Искать" />
    </form>
  );
}

function SelectedFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      {['Стиль: Классические', 'Стиль: Военные', 'Густота: Средняя'].map((label) => (
        <span key={label} className="inline-flex h-8 items-center gap-3 rounded-full border border-primary px-3 text-sm leading-5 text-primary">
          {label}
          <span className="text-xl leading-none">×</span>
        </span>
      ))}
    </div>
  );
}

function ProductPanel({
  columns,
  hasNextPage,
  isError,
  isFetching,
  isLoading,
  onRetry,
  products: items,
  sentinelRef,
  viewMode,
}: {
  columns: string;
  hasNextPage: boolean;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onRetry: () => void;
  products: Product[];
  sentinelRef: RefObject<HTMLDivElement | null>;
  viewMode: ProductViewMode;
}) {
  if (isError) {
    return (
      <div className="rounded-lg bg-card p-6 text-center text-sm leading-5 text-muted-foreground shadow-card">
        Не удалось загрузить товары.
        <button className="ml-2 cursor-pointer text-primary-hover" onClick={onRetry} type="button">
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-card">
      <div className={cn('grid', viewMode === 'grid' ? cn('gap-x-4 gap-y-10', columns) : 'gap-0')}>
        {items.map((product) => (
          <CatalogProductCard
            key={product.id}
            product={product}
            imageClassName={columns === 'grid-cols-2' ? 'h-[172px]' : 'h-[160px]'}
            compact={columns === 'grid-cols-2'}
            viewMode={viewMode}
          />
        ))}
      </div>
      {isLoading || (isFetching && hasNextPage) ? (
        <p className="mt-6 text-center text-sm leading-5 text-muted-foreground">Загружаем товары...</p>
      ) : null}
      <div ref={sentinelRef} className="h-1" />
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
          <span className="text-xl leading-5 font-bold">{currency.format(product.price)}</span>
          <ProductCartControl
            className="h-10 w-full md:w-36"
            inStock={product.inStock}
            productId={product.id}
            productName={product.name}
          />
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
        <span className="text-xl leading-5 font-bold text-success">{currency.format(product.price)}</span>
      </div>
      <ProductCartControl
        className="h-10 w-full"
        inStock={product.inStock}
        productId={product.id}
        productName={product.name}
      />
    </article>
  );
}

function DesktopCheckboxGroup({ title, items, checked = [] }: { title: string; items: string[]; checked?: string[] }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-base leading-6 font-bold">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-2 text-sm leading-5">
            <span className={cn('grid size-4 place-items-center rounded-sm border border-muted-foreground', checked.includes(item) && 'border-primary bg-primary')}>
              {checked.includes(item) ? <span className="size-2 bg-card" /> : null}
            </span>
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function DesktopRadioGroup({ title, items, checked }: { title: string; items: string[]; checked?: string }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-base leading-6 font-bold">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-2 text-sm leading-5">
            <span className="grid size-4 place-items-center rounded-full border border-muted-foreground">
              {checked === item ? <span className="size-2 rounded-full bg-primary" /> : null}
            </span>
            {item}
          </label>
        ))}
      </div>
    </section>
  );
}

function SwitchRow({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm leading-5">
      <span className="h-5 w-10 rounded-full bg-muted-foreground/60 p-0.5">
        <span className="block size-4 rounded-full bg-card" />
      </span>
      {label}
    </label>
  );
}

function FilterCard({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('grid gap-4 rounded-xl bg-card p-4 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-base leading-6 font-bold">{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FilterChip({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span className={cn('inline-flex h-8 items-center rounded bg-muted px-3 text-base leading-6', active && 'border border-primary bg-background text-primary')}>
      {children}
    </span>
  );
}

function MobileRadioGroup({ title, options, active }: { title: string; options: string[]; active: string }) {
  return (
    <FilterCard title={title} className="h-[168px]">
      <div className="grid h-[114px] content-start gap-2">
        {options.map((option) => (
          <label key={option} className={cn('flex h-7 cursor-pointer items-center gap-2 rounded bg-muted px-3 text-base leading-6', option === active && 'border border-primary text-primary')}>
            <span className="grid size-4 place-items-center rounded-full border border-muted-foreground bg-background">
              {option === active ? <span className="size-2 rounded-full bg-primary" /> : null}
            </span>
            {option}
          </label>
        ))}
      </div>
    </FilterCard>
  );
}

function MobileSwitchLabel({ children }: { children: ReactNode }) {
  return (
    <label className="flex h-[52px] cursor-pointer items-center justify-between rounded-xl bg-card px-4 shadow-card">
      <span className="text-sm leading-5">{children}</span>
      <span className="h-5 w-10 rounded-full bg-muted-foreground/70 p-0.5">
        <span className="block size-4 rounded-full bg-card" />
      </span>
    </label>
  );
}
