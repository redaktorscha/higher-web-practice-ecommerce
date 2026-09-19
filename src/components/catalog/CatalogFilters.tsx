import type { ReactNode } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FilterState } from '@/store/api';
import { categories, densities, styles } from './catalogConfig';

type CatalogFiltersProps = {
  filters: FilterState;
  onCategoryToggle: (category: string) => void;
  onClear: () => void;
  onDensityChange: (density: string | null) => void;
  onMaxPriceChange: (price: string) => void;
  onMinPriceChange: (price: string) => void;
  onStyleToggle: (style: string) => void;
  onToggleBoolean: (name: 'requiresWax' | 'boostsCharisma') => void;
};

export function CatalogFilters({
  filters,
  onCategoryToggle,
  onClear,
  onDensityChange,
  onMaxPriceChange,
  onMinPriceChange,
  onStyleToggle,
  onToggleBoolean,
}: CatalogFiltersProps) {
  return (
    <aside className="grid content-start gap-6 rounded-lg bg-card px-6 py-7 shadow-card">
      <section className="grid gap-1 text-base leading-6">
        <h2 className="mb-1 text-sm leading-5 font-bold">Категория</h2>
        {categories.map((item) => (
          <button
            key={item}
            className={cn(
              'h-7 cursor-pointer rounded px-2 text-left text-sm leading-5 transition-colors hover:bg-muted hover:text-primary',
              filters.category === item && 'bg-muted font-bold text-primary',
            )}
            onClick={() => onCategoryToggle(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </section>

      <CatalogCheckboxGroup checked={filters.styles} items={styles} onToggle={onStyleToggle} title="Стиль" />
      <CatalogRadioGroup checked={filters.density} items={densities} onChange={onDensityChange} title="Густота" />

      <section className="grid gap-3">
        <h2 className="text-sm leading-5 font-bold">Фильтр</h2>
        <CatalogSwitch
          checked={filters.requiresWax === true}
          label="требует укладки воском"
          onToggle={() => onToggleBoolean('requiresWax')}
        />
        <CatalogSwitch
          checked={filters.boostsCharisma === true}
          label="повышает харизму"
          onToggle={() => onToggleBoolean('boostsCharisma')}
        />
      </section>

      <PriceFields filters={filters} onMaxPriceChange={onMaxPriceChange} onMinPriceChange={onMinPriceChange}>
        <Button onClick={onClear} type="button" variant="secondary" className="h-10 w-full">
          Очистить фильтры
        </Button>
      </PriceFields>
    </aside>
  );
}

export function PriceFields({
  filters,
  onMaxPriceChange,
  onMinPriceChange,
  children,
}: Pick<CatalogFiltersProps, 'filters' | 'onMaxPriceChange' | 'onMinPriceChange'> & { children?: ReactNode }) {
  return (
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
      {children}
    </section>
  );
}

export function CatalogCheckboxGroup({ checked, items, onToggle, title }: {
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
          <label key={item} className="flex cursor-pointer items-center gap-2 text-sm leading-5">
            <input
              checked={checked.includes(item)}
              className="size-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-muted-foreground bg-background checked:border-primary checked:bg-primary"
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

export function CatalogRadioGroup({ checked, items, onChange, title }: {
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
          <label key={item} className="flex cursor-pointer items-center gap-2 text-sm leading-5">
            <input
              checked={checked === item}
              className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-muted-foreground bg-background checked:border-[5px] checked:border-primary"
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

export function CatalogSwitch({ checked, label, onToggle }: {
  checked: boolean;
  label: ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className="flex cursor-pointer items-center gap-2 text-left text-xs leading-4"
      onClick={onToggle}
      type="button"
    >
      <span className={cn('h-5 w-10 rounded-full p-0.5 transition-colors', checked ? 'bg-primary' : 'bg-muted-foreground/60')}>
        <span className={cn('block size-4 rounded-full bg-card transition-transform', checked && 'translate-x-5')} />
      </span>
      {label}
    </button>
  );
}
