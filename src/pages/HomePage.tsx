import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Icon,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import { SearchField } from '@/components/app';
import { cn } from '@/lib/utils';
import { useAddToCartMutation, useGetProductsQuery, type GetProductsParams } from '@/store/api';
import type { Product, ProductSort } from '@/types';

const DESKTOP_PAGE_SIZE = 12;

const categories = [
  'Классические',
  'Исторические',
  'Театральные',
  'Экспериментальные',
  'Экзотические',
  'Современные',
];

const styles = ['Деловой', 'Винтаж', 'Театральный', 'Экспериментальный', 'Военный'];
const density = ['Низкая', 'Средняя', 'Высокая'];

const sortOptions: Array<{ value: ProductSort | 'default'; label: string }> = [
  { value: 'default', label: 'Сортировка' },
  { value: 'rating', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'newest', label: 'Новинки' },
];

const displayOptions = [
  { value: 'grid', label: 'Отображение' },
  { value: 'compact', label: 'Компактно' },
];

const productNames: Record<string, string> = {
  architect: 'Архитектор',
  aviator: 'Пионер авиации',
  brush: 'Щёточка',
  chairman: 'Председатель',
  critic: 'Театральный критик',
  detective: 'Детектив',
  emperor: 'Император',
  enginere: 'Инженер',
  focus: 'Фокусник',
  gentelmen: 'Джентльмен',
  highlander: 'Горец',
  librarian: 'Библиотекарь',
  maestro: 'Маэстро',
  navigator: 'Навигатор',
  polar: 'Полярник',
  sand: 'Пустынные',
};

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function formatPrice(price: number) {
  return currency.format(price).replace(/\u00a0/g, ' ');
}

function getProductSlug(product: Product) {
  const image = product.images[0] ?? '';
  return image.split('/').filter(Boolean).at(-2) ?? '';
}

function getProductName(product: Product) {
  return productNames[getProductSlug(product)] ?? product.name;
}

export function HomePage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ProductSort | 'default'>('default');

  const params = useMemo<GetProductsParams>(
    () => ({
      page,
      pageSize: DESKTOP_PAGE_SIZE,
      sort: sort === 'default' ? undefined : sort,
    }),
    [page, sort],
  );

  const { data, isError, isLoading } = useGetProductsQuery(params);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / DESKTOP_PAGE_SIZE));

  return (
    <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
      <CatalogFilters className="hidden md:grid" />

      <section className="grid min-w-0 gap-3 md:gap-4">
        <div className="md:hidden">
          <SearchField />
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <h1>УСЫ</h1>
          <div className="flex gap-2">
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as ProductSort | 'default');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] border-muted-foreground bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="grid">
              <SelectTrigger className="w-[152px] border-muted-foreground bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {displayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-none bg-transparent md:rounded-lg md:bg-card md:p-6 md:shadow-card">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Не удалось загрузить товары</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-1 gap-y-2 md:grid-cols-4 md:gap-x-4 md:gap-y-10">
              {(data?.items ?? []).map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <CatalogPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
    </div>
  );
}

function CatalogFilters({ className }: { className?: string }) {
  return (
    <aside className={cn('content-start gap-6 rounded-lg bg-card px-6 py-7 shadow-card', className)}>
      <FilterSection title="Категория" className="gap-2">
        {categories.map((category) => (
          <button key={category} className="h-10 rounded-md px-4 text-left text-base hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            {category}
          </button>
        ))}
      </FilterSection>

      <FilterSection title="Стиль">
        {styles.map((style) => (
          <label key={style} className="flex items-center gap-2 text-sm leading-5">
            <Checkbox />
            {style}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Густота">
        <RadioGroup>
          {density.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm leading-5">
              <RadioGroupItem value={item} />
              {item}
            </label>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Фильтр">
        <label className="flex items-center gap-2 text-sm leading-5">
          <Switch />
          требует укладки воском
        </label>
        <label className="flex items-center gap-2 text-sm leading-5">
          <Switch />
          повышает харизму
        </label>
      </FilterSection>

      <FilterSection title="Цена">
        <div className="grid grid-cols-2 gap-2">
          <input className="h-10 rounded-md border border-input bg-card px-3 outline-none focus:border-primary" defaultValue="10" aria-label="Цена от" />
          <input className="h-10 rounded-md border border-input bg-card px-3 outline-none focus:border-primary" defaultValue="1000" aria-label="Цена до" />
        </div>
        <Button variant="secondary" disabled>
          Очистить фильтры
        </Button>
      </FilterSection>
    </aside>
  );
}

function FilterSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('grid gap-3', className)}>
      <h3 className="text-base leading-6">{title}</h3>
      {children}
    </section>
  );
}

function HomeProductCard({ product }: { product: Product }) {
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const productName = getProductName(product);

  return (
    <article className="grid min-w-0 content-start gap-2 md:gap-3">
      <Link to={`/products/${product.id}`} className="block h-[172px] overflow-hidden bg-card md:h-[180px]">
        <img
          src={product.images[0]}
          alt={productName}
          className="h-full w-full object-contain transition-transform hover:scale-[1.03]"
        />
      </Link>

      <div className="grid gap-2">
        <Link to={`/products/${product.id}`} className="truncate text-sm leading-5 md:text-base md:leading-6">
          {productName}
        </Link>
        <span className="text-xl leading-5 font-bold text-success">{formatPrice(product.price)}</span>
      </div>

      <Button
        className="h-10 w-full"
        variant="iconPrimary"
        aria-label={`Добавить в корзину: ${productName}`}
        disabled={!product.inStock || isLoading}
        onClick={() => {
          void addToCart({ productId: product.id, quantity: 1 });
        }}
      >
        <Icon name="shoppingBag" />
      </Button>
    </article>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-2 md:grid-cols-4 md:gap-x-4 md:gap-y-10">
      {Array.from({ length: DESKTOP_PAGE_SIZE }).map((_, index) => (
        <div key={index} className="grid gap-3">
          <div className="h-[172px] animate-pulse bg-muted md:h-[180px]" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}

function CatalogPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <Pagination className="hidden md:flex">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))} />
        </PaginationItem>
        {[1, 2, 3, 4].filter((item) => item <= totalPages).map((item) => (
          <PaginationItem key={item}>
            <PaginationLink isActive={page === item} onClick={() => onPageChange(item)}>
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > 5 ? (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        ) : null}
        {totalPages > 4 ? (
          <PaginationItem>
            <PaginationLink isActive={page === totalPages} onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext disabled={page === totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))} />
        </PaginationItem>
        <PaginationItem>
          <input
            className="h-10 w-10 rounded-md border border-input bg-card text-center text-muted-foreground outline-none focus:border-primary"
            value={page}
            onChange={(event) => {
              const nextPage = Number(event.target.value);
              if (Number.isInteger(nextPage) && nextPage >= 1 && nextPage <= totalPages) {
                onPageChange(nextPage);
              }
            }}
            aria-label="Переход на страницу"
          />
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm text-muted-foreground">Переход на страницу</span>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
