import type { FilterState } from '@/store/api';

export const CATALOG_PAGE_SIZE = 12;
export const FILTER_DEBOUNCE_MS = 350;
export const categories = ['Классические', 'Исторические', 'Театральные', 'Экспериментальные', 'Экзотические', 'Современные'];
export const styles = ['Классический', 'Винтаж', 'Театральный', 'Экспериментальный', 'Военный', 'Минимализм', 'Экзотический'];
export const densities = ['Низкая', 'Средняя', 'Высокая'];

export type CatalogPageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function createInitialFilters(search = ''): FilterState {
  return {
    page: 1,
    limit: CATALOG_PAGE_SIZE,
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
  };
}

export function createFiltersFromSearchParams(searchParams: URLSearchParams, search = ''): FilterState {
  return {
    ...createInitialFilters(search),
    category: searchParams.get('category'),
    styles: searchParams.getAll('style'),
    density: searchParams.get('density'),
    requiresWax: searchParams.get('requiresWax') === 'true' ? true : null,
    boostsCharisma: searchParams.get('boostsCharisma') === 'true' ? true : null,
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    sortBy: searchParams.get('sortBy'),
    order: searchParams.get('order') === 'asc' || searchParams.get('order') === 'desc'
      ? searchParams.get('order') as 'asc' | 'desc'
      : null,
  };
}

export function getFiltersSearchParams(filters: FilterState) {
  const searchParams = new URLSearchParams();

  if (filters.category) searchParams.set('category', filters.category);
  filters.styles.forEach((style) => searchParams.append('style', style));
  if (filters.density) searchParams.set('density', filters.density);
  if (filters.requiresWax) searchParams.set('requiresWax', 'true');
  if (filters.boostsCharisma) searchParams.set('boostsCharisma', 'true');
  if (filters.minPrice !== '') searchParams.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== '') searchParams.set('maxPrice', String(filters.maxPrice));

  if (filters.sortBy && filters.order) {
    searchParams.set('sortBy', filters.sortBy);
    searchParams.set('order', filters.order);
  }

  return searchParams;
}

export function getPaginationItems(currentPage: number, totalPages: number): CatalogPageItem[] {
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
