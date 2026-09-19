import { ChevronRight } from 'lucide-react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FilterState } from '@/store/api';
import type { Product } from '@/types';
import {
  CatalogCheckboxGroup,
  CatalogRadioGroup,
  CatalogSwitch,
  PriceFields,
} from './CatalogFilters';
import {
  CatalogError,
  CatalogPagination,
  CatalogProductCard,
  CatalogProductSkeleton,
} from './CatalogProducts';
import {
  CATALOG_PAGE_SIZE,
  categories,
  densities,
  styles,
  type CatalogPageItem,
} from './catalogConfig';

export function MobileCatalogSearch({ onSearch }: { onSearch: (search: string) => void }) {
  return (
    <form
      className="flex h-9 items-center gap-2 rounded-lg border border-primary bg-card px-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSearch(String(formData.get('search') ?? ''));
      }}
    >
      <Icon name="search" size={16} className="text-muted-foreground" />
      <input
        className="min-w-0 flex-1 bg-transparent text-base leading-6 outline-none placeholder:text-muted-foreground"
        name="search"
        placeholder="Искать"
      />
    </form>
  );
}

export function MobileCategoryPage({ onCategorySelect, onSearch }: {
  onCategorySelect: (category: string) => void;
  onSearch: (search: string) => void;
}) {
  return (
    <section className="grid gap-4 md:hidden">
      <MobileCatalogSearch onSearch={onSearch} />
      <div className="flex h-6 items-center gap-2 text-sm leading-5">
        <Link to="/" aria-label="Назад" className="cursor-pointer text-xl leading-none">←</Link>
        <span className="font-bold">Усы</span>
      </div>
      <div className="grid gap-1">
        {categories.map((category) => (
          <button
            className="flex h-10 cursor-pointer items-center justify-between text-left text-sm leading-5"
            key={category}
            onClick={() => onCategorySelect(category)}
            type="button"
          >
            {category}
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function MobileProductList({
  category,
  isError,
  isFetching,
  isLoading,
  onBack,
  onFilterOpen,
  onPageChange,
  onRetry,
  onSearch,
  onTargetPageChange,
  onTargetPageSubmit,
  page,
  paginationItems,
  products,
  targetPage,
  totalPages,
}: {
  category: string;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onBack: () => void;
  onFilterOpen: () => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearch: (search: string) => void;
  onTargetPageChange: (page: string) => void;
  onTargetPageSubmit: (event: FormEvent<HTMLFormElement>) => void;
  page: number;
  paginationItems: CatalogPageItem[];
  products: Product[];
  targetPage: string;
  totalPages: number;
}) {
  return (
    <section className="grid gap-3 md:hidden">
      <MobileCatalogSearch onSearch={onSearch} />
      <div className="grid w-[calc(100vw-40px)] max-w-full grid-cols-[minmax(0,1fr)_32px] items-start gap-3">
        <div className="grid min-w-0 gap-1">
          <button className="min-w-0 cursor-pointer truncate text-left text-sm leading-5 text-muted-foreground" onClick={onBack} type="button">
            Усы / {category}
          </button>
          <h1 className="text-xl leading-7 font-bold">{category}</h1>
        </div>
        <button
          aria-label="Открыть фильтры"
          className="mr-3 grid size-8 cursor-pointer place-items-center rounded-md text-foreground hover:text-primary"
          onClick={onFilterOpen}
          type="button"
        >
          <Icon name="sliders" size={24} />
        </button>
      </div>

      {isError ? (
        <CatalogError onRetry={onRetry} />
      ) : (
        <>
          {isLoading || products.length > 0 ? (
            <div className={cn('grid grid-cols-2 gap-x-1 gap-y-2', isFetching && !isLoading && 'opacity-60')}>
              {isLoading
                ? Array.from({ length: CATALOG_PAGE_SIZE }, (_, index) => <CatalogProductSkeleton key={index} />)
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
              onPageChange={onPageChange}
              onTargetPageChange={onTargetPageChange}
              onTargetPageSubmit={onTargetPageSubmit}
              page={page}
              targetPage={targetPage}
              totalPages={totalPages}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

export function MobileFiltersPage({
  filters,
  onBack,
  onClear,
  onDensityChange,
  onMaxPriceChange,
  onMinPriceChange,
  onSearch,
  onShowProducts,
  onStyleToggle,
  onToggleBoolean,
}: {
  filters: FilterState;
  onBack: () => void;
  onClear: () => void;
  onDensityChange: (density: string | null) => void;
  onMaxPriceChange: (price: string) => void;
  onMinPriceChange: (price: string) => void;
  onSearch: (search: string) => void;
  onShowProducts: () => void;
  onStyleToggle: (style: string) => void;
  onToggleBoolean: (name: 'requiresWax' | 'boostsCharisma') => void;
}) {
  return (
    <section className="grid gap-4 pb-20 md:hidden">
      <MobileCatalogSearch onSearch={onSearch} />
      <div className="flex h-8 items-center gap-2">
        <button aria-label="Назад" className="cursor-pointer text-[28px] leading-none" onClick={onBack} type="button">←</button>
        <h1 className="text-2xl leading-8 font-bold">Фильтры</h1>
      </div>

      <div className="grid gap-5 rounded-xl bg-card p-4 shadow-card">
        <CatalogCheckboxGroup checked={filters.styles} items={styles} onToggle={onStyleToggle} title="Стиль" />
        <CatalogRadioGroup checked={filters.density} items={densities} onChange={onDensityChange} title="Густота" />
        <section className="grid gap-3">
          <h2 className="text-sm leading-5 font-bold">Фильтр</h2>
          <CatalogSwitch checked={filters.requiresWax === true} label="требует укладки воском" onToggle={() => onToggleBoolean('requiresWax')} />
          <CatalogSwitch checked={filters.boostsCharisma === true} label="повышает харизму" onToggle={() => onToggleBoolean('boostsCharisma')} />
        </section>
        <PriceFields filters={filters} onMaxPriceChange={onMaxPriceChange} onMinPriceChange={onMinPriceChange} />
      </div>

      <div className="grid gap-3">
        <Button className="h-10 w-full" onClick={onShowProducts} type="button">Показать товары</Button>
        <Button onClick={onClear} type="button" variant="secondary" className="h-10 w-full">Очистить фильтры</Button>
      </div>
    </section>
  );
}
