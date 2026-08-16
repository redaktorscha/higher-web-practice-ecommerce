import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AddToCartPayload,
  Cart,
  CartItem,
  CreateOrderPayload,
  LoginPayload,
  Order,
  OrderCustomerInfo,
  OrderItem,
  PickupPoint,
  Product,
  ProductListResponse,
  ProductRating,
  ProductSort,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types';

type UserWithPassword = User & {
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

type ProductFilterValue = string | string[];

export type GetProductsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: ProductSort;
  inStock?: boolean;
  minRating?: number;
  characteristics?: Record<string, ProductFilterValue>;
};

type CreateOrderRequest = CreateOrderPayload & {
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  customer: OrderCustomerInfo;
};

type CartRecord = CartItem & {
  id: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const TOKEN_STORAGE_KEY = 'token';

const generateFakeToken = (userId: string) =>
  btoa(JSON.stringify({ id: userId, exp: Date.now() + 86_400_000 }));

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const parsed = JSON.parse(atob(token)) as { id?: unknown; exp?: unknown };

    if (
      typeof parsed.exp === 'number' &&
      parsed.exp < Date.now()
    ) {
      return null;
    }

    return typeof parsed.id === 'string' ? parsed.id : null;
  } catch {
    return null;
  }
};

function getStoredToken() {
  return typeof window === 'undefined'
    ? null
    : localStorage.getItem(TOKEN_STORAGE_KEY);
}

function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

function sanitizeUser(user: UserWithPassword): User {
  const publicUser = { ...user };
  delete (publicUser as Partial<UserWithPassword>).password;

  return publicUser;
}

function makeClientError(status: number, data: string) {
  return {
    status,
    data,
  };
}

function createEntityId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCart(records: CartRecord[]): Cart {
  const items = records.map((record) => ({
    productId: record.productId,
    product: record.product,
    quantity: record.quantity,
    price: record.price,
  }));

  return {
    items,
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function applyProductFilters(products: Product[], params?: GetProductsParams) {
  const search = params?.search?.trim().toLowerCase();

  return products.filter((product) => {
    if (search) {
      const searchableText = `${product.name} ${product.description}`.toLowerCase();

      if (!searchableText.includes(search)) {
        return false;
      }
    }

    if (typeof params?.inStock === 'boolean' && product.inStock !== params.inStock) {
      return false;
    }

    if (typeof params?.minRating === 'number' && product.rating < params.minRating) {
      return false;
    }

    if (params?.characteristics) {
      return Object.entries(params.characteristics).every(([key, expected]) => {
        const actual = product.characteristics[key];

        if (Array.isArray(expected)) {
          return expected.length === 0 || expected.includes(actual);
        }

        return expected === actual;
      });
    }

    return true;
  });
}

function sortProducts(products: Product[], sort?: ProductSort) {
  const sortedProducts = [...products];

  switch (sort) {
    case 'price_asc':
      return sortedProducts.sort((first, second) => first.price - second.price);
    case 'price_desc':
      return sortedProducts.sort((first, second) => second.price - first.price);
    case 'newest':
      return sortedProducts.sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      );
    case 'rating':
      return sortedProducts.sort((first, second) => second.rating - first.rating);
    default:
      return sortedProducts;
  }
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getStoredToken();

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Order', 'Cart', 'Rating', 'PickupPoint'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      async queryFn(credentials, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(
          `/users?email=${encodeURIComponent(credentials.email)}`,
        );

        if (result.error) {
          return { error: result.error };
        }

        const user = (result.data as UserWithPassword[])[0];

        if (!user || user.password !== credentials.password) {
          return { error: makeClientError(401, 'Неверный логин или пароль') };
        }

        const token = generateFakeToken(user.id);
        saveToken(token);

        return {
          data: {
            token,
            user: sanitizeUser(user),
          },
        };
      },
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<User, RegisterPayload>({
      async queryFn(payload, _queryApi, _extraOptions, fetchWithBQ) {
        const existingUsersResult = await fetchWithBQ(
          `/users?email=${encodeURIComponent(payload.email)}`,
        );

        if (existingUsersResult.error) {
          return { error: existingUsersResult.error };
        }

        if ((existingUsersResult.data as User[]).length > 0) {
          return {
            error: makeClientError(400, 'Пользователь с таким email уже существует'),
          };
        }

        if (payload.password !== payload.confirmPassword) {
          return { error: makeClientError(400, 'Пароли не совпадают') };
        }

        const newUser: UserWithPassword = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          id: createEntityId(),
          createdAt: new Date().toISOString(),
          language: 'ru',
          notifyByEmail: false,
        };

        const result = await fetchWithBQ({
          url: '/users',
          method: 'POST',
          body: newUser,
        });

        return result.data
          ? { data: sanitizeUser(result.data as UserWithPassword) }
          : { error: result.error ?? makeClientError(500, 'Не удалось создать пользователя') };
      },
      invalidatesTags: ['User'],
    }),

    getProfile: builder.query<User, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const token = getStoredToken();
        const userId = token ? getUserIdFromToken(token) : null;

        if (!userId) {
          return { error: makeClientError(401, 'Unauthorized') };
        }

        const result = await fetchWithBQ(`/users/${encodeURIComponent(userId)}`);

        return result.data
          ? { data: sanitizeUser(result.data as UserWithPassword) }
          : { error: result.error ?? makeClientError(404, 'Пользователь не найден') };
      },
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<User, UpdateProfilePayload>({
      async queryFn(payload, _queryApi, _extraOptions, fetchWithBQ) {
        const token = getStoredToken();
        const userId = token ? getUserIdFromToken(token) : null;

        if (!userId) {
          return { error: makeClientError(401, 'Unauthorized') };
        }

        const result = await fetchWithBQ({
          url: `/users/${encodeURIComponent(userId)}`,
          method: 'PATCH',
          body: payload,
        });

        return result.data
          ? { data: sanitizeUser(result.data as UserWithPassword) }
          : { error: result.error ?? makeClientError(404, 'Пользователь не найден') };
      },
      invalidatesTags: ['User'],
    }),

    getProducts: builder.query<ProductListResponse, GetProductsParams | void>({
      async queryFn(params, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ('/products');

        if (result.error) {
          return { error: result.error };
        }

        const page = Math.max(params?.page ?? DEFAULT_PAGE, 1);
        const pageSize = Math.max(params?.pageSize ?? DEFAULT_PAGE_SIZE, 1);
        const filteredProducts = applyProductFilters(result.data as Product[], params ?? undefined);
        const sortedProducts = sortProducts(filteredProducts, params?.sort);
        const startIndex = (page - 1) * pageSize;

        return {
          data: {
            items: sortedProducts.slice(startIndex, startIndex + pageSize),
            total: sortedProducts.length,
            page,
            pageSize,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    getOrders: builder.query<Order[], { userId?: string } | void>({
      query: (params) => ({
        url: '/orders',
        params: params?.userId ? { userId: params.userId } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),

    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (payload) => ({
        url: '/orders',
        method: 'POST',
        body: {
          ...payload,
          id: createEntityId(),
          number: `ORDER-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        } satisfies Order,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    getCart: builder.query<Cart, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ('/cart');

        return result.data
          ? { data: normalizeCart(result.data as CartRecord[]) }
          : { error: result.error ?? makeClientError(500, 'Не удалось загрузить корзину') };
      },
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<CartItem, AddToCartPayload>({
      async queryFn(payload, _queryApi, _extraOptions, fetchWithBQ) {
        const [cartResult, productResult] = await Promise.all([
          fetchWithBQ('/cart'),
          fetchWithBQ(`/products/${encodeURIComponent(payload.productId)}`),
        ]);

        if (cartResult.error) {
          return { error: cartResult.error };
        }

        if (productResult.error) {
          return { error: productResult.error };
        }

        const records = cartResult.data as CartRecord[];
        const product = productResult.data as Product;
        const quantity = payload.quantity ?? 1;
        const existingRecord = records.find(
          (item) => item.productId === payload.productId,
        );

        const result = existingRecord
          ? await fetchWithBQ({
              url: `/cart/${encodeURIComponent(existingRecord.id)}`,
              method: 'PATCH',
              body: { quantity: existingRecord.quantity + quantity },
            })
          : await fetchWithBQ({
              url: '/cart',
              method: 'POST',
              body: {
                id: payload.productId,
                productId: payload.productId,
                product,
                quantity,
                price: product.price,
              } satisfies CartRecord,
            });

        return result.data
          ? { data: result.data as CartItem }
          : { error: result.error ?? makeClientError(500, 'Не удалось обновить корзину') };
      },
      invalidatesTags: ['Cart'],
    }),

    getRatings: builder.query<ProductRating[], void>({
      query: () => '/ratings',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ productId, userId }) => ({
                type: 'Rating' as const,
                id: `${productId}:${userId}`,
              })),
              { type: 'Rating' as const, id: 'LIST' },
            ]
          : [{ type: 'Rating' as const, id: 'LIST' }],
    }),

    getRatingById: builder.query<ProductRating, string>({
      query: (id) => `/ratings/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: 'Rating', id }],
    }),

    getPickupPoints: builder.query<PickupPoint[], void>({
      query: () => '/pickupPoints',
      providesTags: ['PickupPoint'],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useCreateOrderMutation,
  useGetCartQuery,
  useGetOrdersQuery,
  useGetPickupPointsQuery,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useGetProfileQuery,
  useGetRatingByIdQuery,
  useGetRatingsQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
} = api;
