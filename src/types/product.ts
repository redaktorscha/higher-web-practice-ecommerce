export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  characteristics: Record<string, string>;
  inStock: boolean;
  rating: number; // 1–5
  ratingCount: number;
  createdAt: string;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSort = 'price_asc' | 'price_desc' | 'newest' | 'rating';

export type ProductRating = {
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  createdAt: string;
};
