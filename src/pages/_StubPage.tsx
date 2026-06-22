import { Filters, ProductCard, SearchField } from '@/components/app';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Pagination,
  PaginationContent,
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

type StubPageProps = {
  title?: string;
};

const sampleProducts = [
  {
    id: 'chairman',
    title: 'Председательские усы',
    image: '/mustashes/chairman/0.png',
    price: 5590,
    rating: 4.5,
    ratingCount: 2,
  },
  {
    id: 'gentelmen',
    title: 'Джентльмен',
    image: '/mustashes/gentelmen/0.png',
    price: 1790,
    rating: 4.8,
    ratingCount: 14,
  },
  {
    id: 'aviator',
    title: 'Авиатор',
    image: '/mustashes/aviator/0.png',
    price: 3290,
    rating: 4.2,
    ratingCount: 7,
  },
];

export function StubPage({ title = 'UI-kit витрина' }: StubPageProps) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:hidden">
        <SearchField />
      </section>

      <section className="grid gap-4">
        <h1>{title}</h1>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text button</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Модальное окно</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Подтверждение</DialogTitle>
                <DialogDescription>Компонент модального окна собран на Radix Dialog и стилях из Figma.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary">Отмена</Button>
                <Button>Готово</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Filters />
        <div className="grid gap-5">
          <div className="grid gap-4 rounded-lg bg-card p-5 shadow-card md:grid-cols-3">
            <Input placeholder="Текстовое поле" />
            <Select defaultValue="newest">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Новинки</SelectItem>
                <SelectItem value="popular">Популярное</SelectItem>
              </SelectContent>
            </Select>
            <label className="flex items-center gap-3 text-sm">
              <Switch defaultChecked />
              Переключатель
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox defaultChecked />
              Чекбокс
            </label>
            <RadioGroup defaultValue="one" className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="one" />
                Вариант 1
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="two" />
                Вариант 2
              </label>
            </RadioGroup>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  );
}
