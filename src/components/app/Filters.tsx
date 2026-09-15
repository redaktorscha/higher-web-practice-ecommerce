import { Button, Checkbox, Icon, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@/components/ui';
import { cn } from '@/lib/utils';

type FiltersProps = {
  className?: string;
};

const categories = ['Классические', 'Фигурные', 'Деловые', 'Повседневные'];
const sortOptions = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'newest', label: 'Новинки' },
];

function Filters({ className }: FiltersProps) {
  return (
    <aside className={cn('grid gap-6 rounded-lg bg-card p-5 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3>Фильтры</h3>
        <Button variant="iconSecondary" aria-label="Сбросить фильтры">
          <Icon name="x" />
        </Button>
      </div>

      <section className="grid gap-3">
        <span className="text-sm font-bold">Сортировка</span>
        <Select defaultValue="popular">
          <SelectTrigger>
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
      </section>

      <section className="grid gap-3">
        <span className="text-sm font-bold">Категория</span>
        <div className="grid gap-3">
          {categories.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox />
              {category}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <span className="text-sm font-bold">Рейтинг</span>
        <RadioGroup defaultValue="4">
          {['5', '4', '3'].map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-3 text-sm">
              <RadioGroupItem value={rating} />
              от {rating} звезд
            </label>
          ))}
        </RadioGroup>
      </section>

      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
        Только в наличии
        <Switch defaultChecked />
      </label>

      <Button>Применить</Button>
    </aside>
  );
}

export { Filters };
