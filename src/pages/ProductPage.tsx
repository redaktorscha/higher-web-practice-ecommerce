import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';
import { useGetProductByIdQuery } from '@/store/api';
import type { Product } from '@/types';

const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function formatPrice(price: number) {
  return currency.format(price).replace(/\u00a0/g, ' ');
}

function getProductTitle(product: Product) {
  return `Купить усы ${product.name} за ${formatPrice(product.price)} в магазине Quant`;
}

export function ProductPage() {
  const { id } = useParams();
  const {
    data: product,
    isError,
    isLoading,
  } = useGetProductByIdQuery(id ?? '', {
    skip: !id,
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    document.title = getProductTitle(product);
  }, [product]);

  if (!id || isError) {
    return <Navigate replace to="/404" />;
  }

  if (isLoading || !product) {
    return <p className="text-sm text-muted-foreground">Загрузка товара...</p>;
  }

  const mainImage = product.images[0];

  return (
    <section className="grid gap-6">
      <Button asChild variant="text" className="w-fit">
        <Link to="/">Назад к каталогу</Link>
      </Button>

      <article className="grid gap-8 md:grid-cols-[minmax(320px,520px)_1fr]">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-lg bg-card shadow-card">
            <img
              src={mainImage}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>

          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className="aspect-square rounded-md bg-card object-cover shadow-card"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid content-start gap-6">
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="star" size={16} className="fill-success text-success" />
              <span>{product.rating.toFixed(1)}</span>
              <span>({product.ratingCount})</span>
            </div>
            <h1>{product.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold leading-9">{formatPrice(product.price)}</span>
            <span className={product.inStock ? 'text-success' : 'text-muted-foreground'}>
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>

          <Button className="w-full md:w-fit" disabled={!product.inStock}>
            <Icon name="shoppingBag" />
            Добавить в корзину
          </Button>

          <section className="grid gap-3">
            <h2>Характеристики</h2>
            <dl className="grid gap-2">
              {Object.entries(product.characteristics).map(([name, value]) => (
                <div
                  key={name}
                  className="grid gap-1 border-b border-border py-2 text-sm sm:grid-cols-[200px_1fr]"
                >
                  <dt className="text-muted-foreground">{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>
    </section>
  );
}
