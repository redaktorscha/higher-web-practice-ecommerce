import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5174';
const user = {
  id: 'user-1',
  firstName: 'Иван',
  lastName: 'Иванов',
  email: 'ivan@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  language: 'ru',
  notifyByEmail: true,
};
const product = {
  id: 'product-1',
  name: 'Председатель',
  description: 'Строгие прямые усы с характерным направлением вниз.',
  price: 5590,
  images: ['/images/chairman.png'],
  characteristics: {},
  category: 'Классические',
  style: 'Деловой',
  density: 'Средняя',
  requiresWax: false,
  boostsCharisma: true,
  inStock: true,
  rating: 5,
  ratingCount: 125,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const token = Buffer
  .from(JSON.stringify({ id: user.id, exp: Date.now() + 86_400_000 }))
  .toString('base64');

let cartRecords = [];
let createdOrder = null;

function jsonResponse(data, status = 200, headers = {}) {
  return {
    status,
    contentType: 'application/json',
    headers,
    body: JSON.stringify(data),
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.addInitScript(([storageKey, storageToken]) => {
  localStorage.setItem(storageKey, storageToken);
}, ['token', token]);

await page.route('**/api/users/user-1', async (route) => {
  await route.fulfill(jsonResponse(user));
});

await page.route('**/api/products/product-1', async (route) => {
  await route.fulfill(jsonResponse(product));
});

await page.route('**/api/products?**', async (route) => {
  await route.fulfill(jsonResponse([product], 200, { 'x-total-count': '1' }));
});

await page.route('**/api/cart?**', async (route) => {
  await route.fulfill(jsonResponse(cartRecords));
});

await page.route('**/api/cart', async (route) => {
  const request = route.request();

  if (request.method() !== 'POST') {
    await route.fulfill(jsonResponse([]));
    return;
  }

  const body = request.postDataJSON();
  const record = {
    id: 'cart-1',
    userId: user.id,
    productId: product.id,
    product,
    quantity: body.quantity ?? 1,
    price: product.price,
  };

  cartRecords = [record];

  await route.fulfill(jsonResponse(record, 201));
});

await page.route('**/api/cart/*', async (route) => {
  const request = route.request();

  if (request.method() !== 'DELETE') {
    await route.fulfill(jsonResponse({}));
    return;
  }

  const recordId = new URL(request.url()).pathname.split('/').at(-1);
  cartRecords = cartRecords.filter((record) => record.id !== recordId);

  await route.fulfill(jsonResponse({}));
});

await page.route('**/api/pickupPoints', async (route) => {
  await route.fulfill(jsonResponse([]));
});

await page.route('**/api/orders', async (route) => {
  const request = route.request();

  if (request.method() !== 'POST') {
    await route.fulfill(jsonResponse([]));
    return;
  }

  createdOrder = request.postDataJSON();

  await route.fulfill(jsonResponse(createdOrder, 201));
});

try {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Добавить в корзину: Председатель' }).click();
  await page.getByRole('button', { name: 'Увеличить количество: Председатель' }).waitFor();

  await page.getByRole('link', { name: /Корзина/ }).click();
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await page.getByRole('button', { name: 'Город *' }).click();
  await page.getByRole('button', { name: 'Москва' }).click();
  await page.getByPlaceholder('улица, дом, квартира *').fill('Тверская, 1');
  await page.getByLabel('Номер телефона *').fill('+7 999 123-45-67');
  await page.getByRole('button', { name: 'Оплатить' }).click();

  await page.getByRole('heading', { name: /Спасибо за покупку/ }).waitFor();

  assert.equal(new URL(page.url()).pathname, '/success');
  assert.equal(createdOrder.userId, user.id);
  assert.equal(createdOrder.items[0].productId, product.id);
  assert.equal(createdOrder.customer.phone, '+7 999 123-45-67');
  assert.deepEqual(cartRecords, []);
} finally {
  await browser.close();
}
