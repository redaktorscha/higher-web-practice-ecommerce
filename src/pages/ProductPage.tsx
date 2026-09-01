import { ChevronLeft, ChevronRight, ShoppingBag, Star } from 'lucide-react';

const product = {
  name: 'Председатель',
  price: '5 590 ₽',
  rating: '5.0',
  ratingCount: '125 оценок',
  description:
    'Густые прямые усы с характерным направлением вниз. Подходят для уверенных решений и серьёзных заявлений.',
  images: [
    '/mustashes/chairman/0.png',
    '/mustashes/chairman/1.png',
    '/mustashes/chairman/2.png',
    '/mustashes/chairman/3.png',
  ],
};

const characteristics = [
  ['Категория', 'Классические'],
  ['Подкатегория', 'Деловые'],
  ['Стиль', 'Военный'],
  ['Форма', 'Короткий прямоугольник'],
  ['Густота', 'Средняя'],
  ['Закрученность', 'Низкая'],
  ['Харизма', '5'],
];

export function ProductPage() {
  return (
    <section className="pb-[92px] md:mx-auto md:w-[984px] md:pb-0 md:pt-0">
      <nav className="mb-5 hidden text-base leading-6 text-muted-foreground md:block">
        Товарная группа / Категория / Подкатегория
      </nav>

      <article className="grid gap-6 rounded-none bg-transparent md:grid-cols-[456px_456px] md:gap-5 md:rounded-xl md:bg-card md:p-6 md:shadow-card">
        <ProductGallery />

        <div className="grid content-start gap-6 md:gap-4">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
            <h1 className="text-[30px] leading-9 md:text-[30px] md:leading-9">{product.name}</h1>
            <div className="row-span-2 grid justify-items-end md:row-span-1">
              <div className="flex items-center gap-2">
                <Star className="size-8 fill-primary-hover text-primary-hover" />
                <span className="font-heading text-[30px] leading-9 font-bold">{product.rating}</span>
              </div>
              <span className="text-sm leading-5 text-muted-foreground">{product.ratingCount}</span>
            </div>
            <p className="text-[30px] leading-9 font-bold text-success md:text-[30px] md:leading-9">{product.price}</p>
          </div>

          <div className="hidden items-end justify-between md:flex">
            <button className="grid h-10 w-[180px] place-items-center rounded-md bg-primary text-white" type="button" aria-label="Добавить в корзину">
              <ShoppingBag className="size-6" />
            </button>
            <span className="text-base leading-6 text-muted-foreground">Есть в наличии</span>
          </div>

          <section className="grid gap-1">
            <h2 className="text-base leading-6">Описание</h2>
            <p className="text-sm leading-5 text-muted-foreground">{product.description}</p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base leading-6">О товаре</h2>
            <dl>
              {characteristics.map(([name, value]) => (
                <div className="grid grid-cols-[1fr_auto] border-b border-border py-2" key={name}>
                  <dt className="text-xs leading-4 text-muted-foreground">{name}</dt>
                  <dd className="text-right text-base leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>

      <ProductRating />

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <button className="grid h-9 w-full place-items-center rounded-md bg-primary text-white" type="button" aria-label="Добавить в корзину">
          <ShoppingBag className="size-4" />
        </button>
      </div>
    </section>
  );
}

function ProductGallery() {
  return (
    <div className="relative">
      <button className="absolute top-[205px] left-[-8px] z-10 text-primary-hover md:hidden" type="button" aria-label="Предыдущее фото">
        <ChevronLeft className="size-10" />
      </button>
      <button className="absolute top-[205px] right-[-8px] z-10 text-primary-hover md:hidden" type="button" aria-label="Следующее фото">
        <ChevronRight className="size-10" />
      </button>

      <div className="mx-auto h-[453px] w-[335px] overflow-hidden rounded-md bg-card md:h-[460px] md:w-[456px]">
        <img alt="" className="h-full w-full object-contain" src={product.images[0]} />
      </div>

      <div className="mt-3 hidden h-[106px] grid-cols-[14px_repeat(4,97px)_14px] items-center gap-2 md:grid">
        <ChevronLeft className="size-4 text-muted-foreground" />
        {product.images.map((image) => (
          <img alt="" className="h-24 w-[97px] object-contain" key={image} src={image} />
        ))}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function ProductRating() {
  return (
    <section className="mt-8 rounded-xl bg-card p-6 shadow-card md:mt-5">
      <div className="grid gap-4 md:gap-4">
        <div className="grid gap-4 md:gap-3">
          <p className="hidden text-base leading-6 md:block">Оцените усы</p>
          <div className="flex justify-between md:w-[194px] md:justify-start md:gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="size-10 text-primary-hover md:size-8" key={index} />
            ))}
          </div>
          <button className="h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:hidden" type="button">
            Оценить
          </button>
        </div>

        <div className="border-t border-[#9ca3af] md:border-border" />

        <div className="grid gap-0">
          <RatingRow name="Виктор П." date="20 января 2021" filled={5} />
          <RatingRow name="Дмитрий С." date="20 января 2021" filled={4} />
          <RatingRow name="Андрей Л." date="20 января 2021" filled={4} last />
        </div>
      </div>
    </section>
  );
}

function RatingRow({
  name,
  date,
  filled,
  last,
}: {
  name: string;
  date: string;
  filled: number;
  last?: boolean;
}) {
  return (
    <div className={last ? 'py-5' : 'border-b border-[#9ca3af] py-5 md:border-border'}>
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-5 font-bold">5.0</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                className={index < filled ? 'size-6 fill-primary text-primary' : 'size-6 text-primary'}
                key={index}
              />
            ))}
          </div>
        </div>
        <span className="hidden text-sm leading-5 text-muted-foreground md:block">{date}</span>
        <div className="flex items-center justify-between md:contents">
          <span className="text-base leading-6">{name}</span>
          <span className="text-sm leading-5 text-muted-foreground md:hidden">{date}</span>
        </div>
      </div>
    </div>
  );
}
