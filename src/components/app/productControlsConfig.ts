export type ProductSortValue = 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
export type ProductViewMode = 'grid' | 'list';

export const productSortOptions = [
  { value: 'popular', label: 'Сортировка', sortBy: null, order: null },
  { value: 'price_asc', label: 'Сначала дешевле', sortBy: 'price', order: 'asc' },
  { value: 'price_desc', label: 'Сначала дороже', sortBy: 'price', order: 'desc' },
  { value: 'newest', label: 'Новинки', sortBy: 'createdAt', order: 'desc' },
  { value: 'rating', label: 'По рейтингу', sortBy: 'rating', order: 'desc' },
] satisfies Array<{
  value: ProductSortValue;
  label: string;
  sortBy: string | null;
  order: 'asc' | 'desc' | null;
}>;

export const productViewOptions = [
  { value: 'grid', label: 'Плитка' },
  { value: 'list', label: 'Список' },
] satisfies Array<{
  value: ProductViewMode;
  label: string;
}>;
