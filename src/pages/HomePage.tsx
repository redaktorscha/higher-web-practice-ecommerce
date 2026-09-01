import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/utils';

type CatalogProduct = {
  id: string;
  title: string;
  price: string;
  image: string;
};

const products: CatalogProduct[] = [
  {
    id: '3e6e9a7a-0a5f-4e2d-9b0a-2e8d6e4c1a01',
    title: 'Председатель',
    price: '5 590 ₽',
    image: '/mustashes/chairman/0.png',
  },
  {
    id: '6a1c2d3e-4f50-4a61-8b72-9c83ad94be02',
    title: 'Джентльмен',
    price: '1 790 ₽',
    image: '/mustashes/gentelmen/0.png',
  },
  {
    id: '7b2d3e4f-5061-4b72-9c83-ad94be05cf03',
    title: 'Детектив',
    price: '1 590 ₽',
    image: '/mustashes/detective/0.png',
  },
  {
    id: '8c3e4f50-6172-4c83-ad94-be05cf16d804',
    title: 'Инженер',
    price: '2 650 ₽',
    image: '/mustashes/enginere/0.png',
  },
  {
    id: '61728394-a5b6-4fb0-8c53-4fd8ef102132',
    title: 'Пустынные',
    price: '1 690 ₽',
    image: '/mustashes/sand/0.png',
  },
  {
    id: 'a05f6172-8394-4e05-8f16-d827e938fa06',
    title: 'Щёточка',
    price: '590 ₽',
    image: '/mustashes/brush/0.png',
  },
];

const desktopCatalogProducts = [products[0], products[1]];

export function HomePage() {
  const location = useLocation();
  const isCatalog = location.pathname.startsWith('/catalog');
  const isMobileFilters = location.pathname === '/catalog/filters';

  if (isMobileFilters) {
    return (
      <>
        <CatalogDesktop className="hidden md:grid" />
        <MobileFilters />
      </>
    );
  }

  if (isCatalog) {
    return (
      <>
        <CatalogDesktop className="hidden md:grid" />
        <MobileCategoryList />
      </>
    );
  }

  return (
    <>
      <HomeDesktop className="hidden md:grid" />
      <MobileHome />
    </>
  );
}

function HomeDesktop({ className }: { className?: string }) {
  return (
    <section className={cn('grid gap-4', className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] leading-10 font-bold">УСЫ</h1>
        <CatalogControls />
      </div>
      <ProductPanel products={products.slice(0, 4)} columns="md:grid-cols-4" />
    </section>
  );
}

function MobileHome() {
  return (
    <section className="grid gap-3 md:hidden">
      <MobileSearch />
      <div className="grid grid-cols-2 gap-x-1 gap-y-2">
        {[products[4], products[5], products[0], products[1], products[2], products[3]].map((product) => (
          <CatalogProductCard key={product.id} product={product} imageClassName="h-[172px]" compact />
        ))}
      </div>
    </section>
  );
}

function CatalogDesktop({ className }: { className?: string }) {
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
            <CatalogControls />
          </div>
          <ProductPanel products={desktopCatalogProducts} columns="md:grid-cols-4" />
        </section>
      </div>
    </div>
  );
}

function MobileCategoryList() {
  return (
    <section className="grid gap-5 md:hidden">
      <MobileSearch />
      <Link to="/catalog/filters" className="flex h-6 items-center justify-between text-sm leading-5">
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
        <Link to="/catalog" aria-label="Назад" className="text-[28px] leading-none">
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
            <button className="flex items-center gap-1 text-base leading-6 text-muted-foreground">
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
        <button className="h-7 text-left text-primary">Все категории</button>
        <button className="h-7 text-left font-bold">Классические</button>
        <button className="h-10 rounded bg-muted px-4 text-left">Деловые</button>
        <button className="h-10 px-4 text-left">Повседневные</button>
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

function ProductPanel({ products: items, columns }: { products: CatalogProduct[]; columns: string }) {
  return (
    <div className="rounded-lg bg-card p-6 shadow-card">
      <div className={cn('grid gap-x-4 gap-y-10', columns)}>
        {items.map((product) => (
          <CatalogProductCard key={product.id} product={product} imageClassName="h-[160px]" />
        ))}
      </div>
    </div>
  );
}

function CatalogProductCard({ product, imageClassName, compact = false }: { product: CatalogProduct; imageClassName: string; compact?: boolean }) {
  return (
    <article className={cn('grid min-w-0 content-start', compact ? 'gap-1' : 'gap-2')}>
      <Link to={`/products/${product.id}`} className={cn('block overflow-hidden bg-card', imageClassName)}>
        <img src={product.image} alt={product.title} className="h-full w-full object-contain" />
      </Link>
      <div className="grid gap-1">
        <Link to={`/products/${product.id}`} className="truncate text-sm leading-5 md:text-base md:leading-6">
          {product.title}
        </Link>
        <span className="text-xl leading-5 font-bold text-success">{product.price}</span>
      </div>
      <Button className="h-10 w-full" variant="iconPrimary" aria-label={`Добавить в корзину: ${product.title}`}>
        <Icon name="shoppingBag" />
      </Button>
    </article>
  );
}

function DesktopCheckboxGroup({ title, items, checked = [] }: { title: string; items: string[]; checked?: string[] }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-base leading-6 font-bold">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
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
          <label key={item} className="flex items-center gap-2 text-sm leading-5">
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
    <label className="flex items-center gap-2 text-sm leading-5">
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
          <label key={option} className={cn('flex h-7 items-center gap-2 rounded bg-muted px-3 text-base leading-6', option === active && 'border border-primary text-primary')}>
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
    <label className="flex h-[52px] items-center justify-between rounded-xl bg-card px-4 shadow-card">
      <span className="text-sm leading-5">{children}</span>
      <span className="h-5 w-10 rounded-full bg-muted-foreground/70 p-0.5">
        <span className="block size-4 rounded-full bg-card" />
      </span>
    </label>
  );
}
