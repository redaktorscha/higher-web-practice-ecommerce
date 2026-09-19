import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ProductControls } from '@/components/app/ProductControls';
import { productSortOptions } from '@/components/app/productControlsConfig';
import type { ProductSortValue, ProductViewMode } from '@/components/app/productControlsConfig';
import {
  CATALOG_PAGE_SIZE,
  CatalogError,
  CatalogFilters,
  CatalogPagination,
  CatalogProducts,
  FILTER_DEBOUNCE_MS,
  MobileCategoryPage,
  MobileFiltersPage,
  MobileProductList,
  createFiltersFromSearchParams,
  createInitialFilters,
  getFiltersSearchParams,
  getPaginationItems,
} from '@/components/catalog';
import type { MainLayoutOutletContext } from '@/components/layout/MainLayout';
import { useGetProductsQuery } from '@/store/api';
import type { FilterState } from '@/store/api';

export function HomePage() {
  const { registerSearchHandler, searchQuery } = useOutletContext<MainLayoutOutletContext>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() => createFiltersFromSearchParams(searchParams, searchQuery));
  const [queryFilters, setQueryFilters] = useState<FilterState>(() => createFiltersFromSearchParams(searchParams, searchQuery));
  const [targetPage, setTargetPage] = useState('1');
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid');
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(queryFilters);

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / CATALOG_PAGE_SIZE);
  const page = queryFilters.page;
  const isMobileFiltersPage = location.pathname === '/filters';
  const selectedCategory = filters.category;
  const selectedSort = productSortOptions.find(
    (option) => option.sortBy === filters.sortBy && option.order === filters.order,
  )?.value ?? 'popular';
  const paginationItems = useMemo(
    () => getPaginationItems(page, totalPages),
    [page, totalPages],
  );

  const scheduleQueryFiltersUpdate = useCallback((nextFilters: FilterState) => {
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);

    filterDebounceRef.current = setTimeout(() => {
      setQueryFilters(nextFilters);
      filterDebounceRef.current = null;
    }, FILTER_DEBOUNCE_MS);
  }, []);

  useEffect(() => () => {
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
  }, []);

  const applySearch = useCallback((search: string) => {
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
      filterDebounceRef.current = null;
    }

    const nextFilters = { ...filters, search, page: 1 };
    setFilters(nextFilters);
    setQueryFilters(nextFilters);
    setTargetPage('1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  useEffect(() => registerSearchHandler(applySearch), [applySearch, registerSearchHandler]);

  const changePage = (nextPage: number) => {
    if (isFetching || nextPage === page || nextPage < 1 || nextPage > totalPages) return;

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

  const updateFilters = (
    nextFilters: Partial<FilterState>,
    options: { immediate?: boolean; syncSearchParams?: boolean } = {},
  ) => {
    const updatedFilters = { ...filters, ...nextFilters, page: 1 };
    setFilters(updatedFilters);
    setTargetPage('1');

    if (options.immediate) {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
        filterDebounceRef.current = null;
      }
      setQueryFilters(updatedFilters);
    } else {
      scheduleQueryFiltersUpdate(updatedFilters);
    }

    if (options.syncSearchParams) {
      setSearchParams(getFiltersSearchParams(updatedFilters), { replace: true });
    }
  };

  const clearFilters = () => {
    const nextFilters = createInitialFilters(searchQuery);
    setFilters(nextFilters);
    scheduleQueryFiltersUpdate(nextFilters);
    setSearchParams(getFiltersSearchParams(nextFilters), { replace: true });
    setTargetPage('1');
  };

  const clearMobileFilters = () => {
    const nextFilters = { ...createInitialFilters(searchQuery), category: filters.category };
    setFilters(nextFilters);
    setQueryFilters(nextFilters);
    setSearchParams(getFiltersSearchParams(nextFilters), { replace: true });
    setTargetPage('1');
  };

  const openMobileCategory = (category: string) => {
    const nextFilters = { ...createInitialFilters(searchQuery), category };
    const nextSearch = getFiltersSearchParams(nextFilters).toString();
    setFilters(nextFilters);
    setQueryFilters(nextFilters);
    setTargetPage('1');
    navigate(nextSearch ? `/?${nextSearch}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMobileFilters = () => {
    const nextSearch = getFiltersSearchParams(filters).toString();
    navigate(`/filters${nextSearch ? `?${nextSearch}` : ''}`);
  };

  const closeMobileFilters = () => {
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
      filterDebounceRef.current = null;
    }
    setQueryFilters(filters);
    const nextSearch = getFiltersSearchParams(filters).toString();
    navigate(`/${nextSearch ? `?${nextSearch}` : ''}`);
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
            onSortChange={(value: ProductSortValue) => {
              const option = productSortOptions.find((item) => item.value === value) ?? productSortOptions[0];
              updateFilters({ sortBy: option.sortBy, order: option.order });
            }}
            onViewChange={setViewMode}
            selectedSort={selectedSort}
            selectedView={viewMode}
          />
        </div>

        <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
          <CatalogFilters
            filters={filters}
            onCategoryToggle={(category) => updateFilters({ category: filters.category === category ? null : category })}
            onClear={clearFilters}
            onDensityChange={(density) => updateFilters({ density })}
            onMaxPriceChange={(maxPrice) => updateFilters({ maxPrice })}
            onMinPriceChange={(minPrice) => updateFilters({ minPrice })}
            onStyleToggle={(style) => updateFilters({
              styles: filters.styles.includes(style)
                ? filters.styles.filter((item) => item !== style)
                : [...filters.styles, style],
            })}
            onToggleBoolean={(name) => updateFilters({ [name]: filters[name] === true ? null : true })}
          />

          <section className="grid content-start gap-2">
            {isError ? (
              <CatalogError onRetry={() => refetch()} />
            ) : (
              <>
                <CatalogProducts isLoading={isLoading} isFetching={isFetching} products={products} viewMode={viewMode} />
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

      {isMobileFiltersPage ? (
        <MobileFiltersPage
          filters={filters}
          onBack={closeMobileFilters}
          onClear={clearMobileFilters}
          onDensityChange={(density) => updateFilters({ density }, { syncSearchParams: true })}
          onMaxPriceChange={(maxPrice) => updateFilters({ maxPrice }, { syncSearchParams: true })}
          onMinPriceChange={(minPrice) => updateFilters({ minPrice }, { syncSearchParams: true })}
          onSearch={applySearch}
          onShowProducts={closeMobileFilters}
          onStyleToggle={(style) => updateFilters({
            styles: filters.styles.includes(style)
              ? filters.styles.filter((item) => item !== style)
              : [...filters.styles, style],
          }, { syncSearchParams: true })}
          onToggleBoolean={(name) => updateFilters({ [name]: filters[name] === true ? null : true }, { syncSearchParams: true })}
        />
      ) : selectedCategory ? (
        <MobileProductList
          category={selectedCategory}
          isError={isError}
          isFetching={isFetching}
          isLoading={isLoading}
          onBack={() => {
            const nextFilters = createInitialFilters(searchQuery);
            setFilters(nextFilters);
            setQueryFilters(nextFilters);
            setSearchParams(getFiltersSearchParams(nextFilters), { replace: true });
            navigate('/');
          }}
          onFilterOpen={openMobileFilters}
          onPageChange={changePage}
          onRetry={() => refetch()}
          onSearch={applySearch}
          onTargetPageChange={setTargetPage}
          onTargetPageSubmit={submitTargetPage}
          page={page}
          paginationItems={paginationItems}
          products={products}
          targetPage={targetPage}
          totalPages={totalPages}
        />
      ) : (
        <MobileCategoryPage onCategorySelect={openMobileCategory} onSearch={applySearch} />
      )}
    </>
  );
}
