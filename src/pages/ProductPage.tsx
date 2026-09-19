import { ShoppingBag, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ProductCartControl } from '@/components/app/ProductCartControl';
import { ProductGallery, ProductRating } from '@/components/product';
import { useAddProductToCart } from '@/hooks/useAddProductToCart';
import { rubleCurrency } from '@/lib/format';
import { useGetOrdersQuery, useGetProductByIdQuery, useGetRatingByIdQuery } from '@/store/api';
import { selectCurrentUser } from '@/store/authSlice';
import { selectCartItemQuantity } from '@/store/cartSlice';
import type { Product } from '@/types';

const characteristicLabels: Array<[string, string]> = [
  ['категория', 'Категория'],
  ['подкатегория', 'Подкатегория'],
  ['стиль', 'Стиль'],
  ['форма', 'Форма'],
  ['густота', 'Густота'],
  ['закрученность', 'Закрученность'],
  ['харизма', 'Харизма'],
];

function getSubcategory(product: Product) {
  return product.characteristics['подкатегория'] ?? product.category;
}

function getRatingCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} оценка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} оценки`;
  return `${count} оценок`;
}

export function ProductPage() {
  const { id = '' } = useParams();
  const user = useSelector(selectCurrentUser);
  const quantity = useSelector(selectCartItemQuantity(id));
  const { addProductToCart, isAddingToCart } = useAddProductToCart();
  const { data: product, isError, isLoading } = useGetProductByIdQuery(id, { skip: !id });
  const { data: ratings = [] } = useGetRatingByIdQuery(id, { skip: !id });
  const { data: orders = [] } = useGetOrdersQuery(user ? { userId: user.id } : undefined, { skip: !user });
  const hasPurchasedProduct = orders.some((order) => order.items.some((item) => item.productId === id));

  if (isLoading) {
    return <ProductPageMessage>Загружаем товар...</ProductPageMessage>;
  }

  if (isError || !product) {
    return <ProductPageMessage>Не удалось загрузить товар</ProductPageMessage>;
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
            <h1 className="text-[30px] leading-9">{product.name}</h1>
            <div className="row-span-2 grid justify-items-end md:row-span-1">
              <div className="flex items-center gap-2">
                <Star className="size-8 fill-primary-hover text-primary-hover" />
                <span className="font-heading text-[30px] leading-9 font-bold">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm leading-5 text-muted-foreground">{getRatingCountLabel(product.ratingCount)}</span>
            </div>
            <p className="text-[30px] leading-9 font-bold text-success">{rubleCurrency.format(product.price)}</p>
          </div>

          <div className="hidden items-end justify-between md:flex">
            <ProductCartControl className="h-10 w-full md:w-36" inStock={product.inStock} productId={product.id} productName={product.name} />
            <span className="text-base leading-6 text-muted-foreground">{product.inStock ? 'Есть в наличии' : 'Нет в наличии'}</span>
          </div>

          <section className="grid gap-1">
            <h2 className="text-base leading-6">Описание</h2>
            <p className="text-sm leading-5 text-muted-foreground">{product.description}</p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base leading-6">О товаре</h2>
            <dl>
              {characteristicLabels.map(([key, label]) => (
                <div className="grid grid-cols-[1fr_auto] border-b border-border py-2" key={key}>
                  <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
                  <dd className="text-right text-base leading-6">{product.characteristics[key] ?? '-'}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>

      <ProductRating canRate={hasPurchasedProduct} key={product.id} productId={product.id} ratings={ratings} user={user} />

      <div className="fixed right-0 bottom-[58px] left-0 rounded-t-xl border border-border bg-card px-5 py-4 md:hidden">
        <button
          aria-label="Добавить в корзину"
          className="grid h-9 w-full cursor-pointer place-items-center rounded-md bg-primary text-white disabled:bg-muted disabled:text-muted-foreground"
          disabled={!product.inStock || isAddingToCart}
          onClick={() => void addProductToCart(product.id)}
          type="button"
        >
          {quantity > 0 ? <span>{quantity}</span> : <ShoppingBag className="size-4" />}
        </button>
      </div>
    </section>
  );
}

function ProductPageMessage({ children }: { children: string }) {
  return (
    <section className="pb-[92px] md:mx-auto md:w-[984px] md:pb-0 md:pt-0">
      <div className="rounded-xl bg-card p-6 text-sm leading-5 text-muted-foreground shadow-card">{children}</div>
    </section>
  );
}
