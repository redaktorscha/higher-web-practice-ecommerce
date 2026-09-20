export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  characteristics: Record<string, string>;
  category: string;
  style: string;
  density: string;
  requiresWax: boolean;
  boostsCharisma: boolean;
  inStock: boolean;
  rating: number; // 1–5
  ratingCount: number;
  createdAt: string;
};

export type PaginatedProductsResponse = {
  items: Product[];
  totalCount: number;
};

export type ProductRating = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  createdAt: string;
};
