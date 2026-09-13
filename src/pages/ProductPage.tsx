import { ChevronLeft, ChevronRight, ShoppingBag, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAddProductToCart } from "@/hooks/useAddProductToCart";
import {
  useGetOrdersQuery,
  useGetProductByIdQuery,
  useGetRatingByIdQuery,
} from "@/store/api";
import { selectCurrentUser } from "@/store/authSlice";
import { selectCartItemQuantity } from "@/store/cartSlice";
import type { Product, ProductRating } from "@/types";
import { ProductCartControl } from "@/components/app/ProductCartControl";

const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const characteristicLabels: Array<[string, string]> = [
  ["категория", "Категория"],
  ["подкатегория", "Подкатегория"],
  ["стиль", "Стиль"],
  ["форма", "Форма"],
  ["густота", "Густота"],
  ["закрученность", "Закрученность"],
  ["харизма", "Харизма"],
];

function getSubcategory(product: Product) {
  return product.characteristics["подкатегория"] ?? product.category;
}

function getRatingCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} оценка`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} оценки`;
  }

  return `${count} оценок`;
}

export function ProductPage() {
  const { id = "" } = useParams();
  const user = useSelector(selectCurrentUser);
  const quantity = useSelector(selectCartItemQuantity(id));
  const { addProductToCart, isAddingToCart } = useAddProductToCart();
  const {
    data: product,
    isError,
    isLoading,
  } = useGetProductByIdQuery(id, { skip: !id });
  const { data: ratings = [] } = useGetRatingByIdQuery(id, { skip: !id });
  const { data: orders = [] } = useGetOrdersQuery(
    user ? { userId: user.id } : undefined,
    { skip: !user },
  );

  const hasPurchasedProduct = orders.some((order) =>
    order.items.some((item) => item.productId === id),
  );

  if (isLoading) {
    return (
      <section className="pb-[92px] md:mx-auto md:w-[984px] md:pb-0 md:pt-0">
        <div className="rounded-xl bg-card p-6 text-sm leading-5 text-muted-foreground shadow-card">
          Загружаем товар...
        </div>
      </section>
    );
  }

  if (isError || !product) {
    return (
      <section className="pb-[92px] md:mx-auto md:w-[984px] md:pb-0 md:pt-0">
        <div className="rounded-xl bg-card p-6 text-sm leading-5 text-muted-foreground shadow-card">
          Не удалось загрузить товар
        </div>
      </section>
    );
  }

  return (
    <section className="pb-[92px] md:mx-auto md:w-[984px] md:pb-0 md:pt-0">
      <nav className="mb-5 hidden text-base leading-6 text-muted-foreground md:block">
        Усы / {product.category} / {getSubcategory(product)}
      </nav>

      <article className="grid gap-6 rounded-none bg-transparent md:grid-cols-[456px_456px] md:gap-5 md:rounded-xl md:bg-card md:p-6 md:shadow-card">
        <ProductGallery product={product} />

        <div className="grid content-start gap-6 md:gap-4">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
            <h1 className="text-[30px] leading-9 md:text-[30px] md:leading-9">
              {product.name}
            </h1>
            <div className="row-span-2 grid justify-items-end md:row-span-1">
              <div className="flex items-center gap-2">
                <Star className="size-8 fill-primary-hover text-primary-hover" />
                <span className="font-heading text-[30px] leading-9 font-bold">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm leading-5 text-muted-foreground">
                {getRatingCountLabel(product.ratingCount)}
              </span>
            </div>
            <p className="text-[30px] leading-9 font-bold text-success md:text-[30px] md:leading-9">
              {currency.format(product.price)}
            </p>
          </div>

          <div className="hidden items-end justify-between md:flex">
            <ProductCartControl
              className="h-10 w-full md:w-36"
              inStock={product.inStock}
              productId={product.id}
              productName={product.name}
            />
            <span className="text-base leading-6 text-muted-foreground">
              {product.inStock ? "Есть в наличии" : "Нет в наличии"}
            </span>
          </div>

          <section className="grid gap-1">
            <h2 className="text-base leading-6">Описание</h2>
            <p className="text-sm leading-5 text-muted-foreground">
              {product.description}
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base leading-6">О товаре</h2>
            <dl>
              {characteristicLabels.map(([key, label]) => (
                <div
                  className="grid grid-cols-[1fr_auto] border-b border-border py-2"
                  key={key}
                >
                  <dt className="text-xs leading-4 text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-right text-base leading-6">
                    {product.characteristics[key] ?? "-"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>

      <ProductRating canRate={hasPurchasedProduct} ratings={ratings} />

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <button
          className="grid h-9 w-full place-items-center rounded-md bg-primary text-white disabled:bg-muted disabled:text-muted-foreground"
          disabled={!product.inStock || isAddingToCart}
          onClick={() => void addProductToCart(product.id)}
          type="button"
          aria-label="Добавить в корзину"
        >
          {quantity > 0 ? (
            <span>{quantity}</span>
          ) : (
            <ShoppingBag className="size-4" />
          )}
        </button>
      </div>
    </section>
  );
}

function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="relative">
      <button
        className="absolute top-[205px] left-[-8px] z-10 text-primary-hover md:hidden"
        type="button"
        aria-label="Предыдущее фото"
      >
        <ChevronLeft className="size-10" />
      </button>
      <button
        className="absolute top-[205px] right-[-8px] z-10 text-primary-hover md:hidden"
        type="button"
        aria-label="Следующее фото"
      >
        <ChevronRight className="size-10" />
      </button>

      <div className="mx-auto h-[453px] w-[335px] overflow-hidden rounded-md bg-card md:h-[460px] md:w-[456px]">
        <img
          alt=""
          className="h-full w-full object-contain"
          src={product.images[0]}
        />
      </div>

      <div className="mt-3 hidden h-[106px] grid-cols-[14px_repeat(4,97px)_14px] items-center gap-2 md:grid">
        <ChevronLeft className="size-4 text-muted-foreground" />
        {product.images.slice(0, 4).map((image) => (
          <img
            alt=""
            className="h-24 w-[97px] object-contain"
            key={image}
            src={image}
          />
        ))}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function ProductRating({
  canRate,
  ratings,
}: {
  canRate: boolean;
  ratings: ProductRating[];
}) {
  return (
    <section className="mt-8 rounded-xl bg-card p-6 shadow-card md:mt-5">
      <div className="grid gap-4 md:gap-4">
        {canRate ? (
          <>
            <div className="grid gap-4 md:gap-3">
              <p className="hidden text-base leading-6 md:block">Оцените усы</p>
              <div className="flex justify-between md:w-[194px] md:justify-start md:gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    className="size-10 text-primary-hover md:size-8"
                    key={index}
                  />
                ))}
              </div>
              <button
                className="h-10 rounded-md border border-primary bg-card px-4 text-base leading-6 font-bold text-primary md:hidden"
                type="button"
              >
                Оценить
              </button>
            </div>

            <div className="border-t border-[#9ca3af] md:border-border" />
          </>
        ) : null}

        <div className="grid gap-0">
          {ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <RatingRow
                date={dateFormatter.format(new Date(rating.createdAt))}
                filled={rating.rating}
                key={`${rating.productId}-${rating.userId}`}
                last={index === ratings.length - 1}
                name={rating.userName}
                score={rating.rating}
              />
            ))
          ) : (
            <p className="text-sm leading-5 text-muted-foreground">
              У этого товара пока нет оценок
            </p>
          )}
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
  score,
}: {
  name: string;
  date: string;
  filled: number;
  last?: boolean;
  score: number;
}) {
  return (
    <div
      className={
        last ? "py-5" : "border-b border-[#9ca3af] py-5 md:border-border"
      }
    >
      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-5 font-bold">
            {score.toFixed(1)}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                className={
                  index < filled
                    ? "size-6 fill-primary text-primary"
                    : "size-6 text-primary"
                }
                key={index}
              />
            ))}
          </div>
        </div>
        <span className="hidden text-sm leading-5 text-muted-foreground md:block">
          {date}
        </span>
        <div className="flex items-center justify-between md:contents">
          <span className="text-base leading-6">{name}</span>
          <span className="text-sm leading-5 text-muted-foreground md:hidden">
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
