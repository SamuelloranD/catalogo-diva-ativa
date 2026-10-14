export const CATALOG_SIZE_OPTIONS = ["P", "M", "G", "G1", "G2", "GG", "Único"] as const;

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
};

export type CatalogImage = {
  id: string;
  productId: string;
  storagePath: string;
  url: string;
  position: number;
  altText: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryId?: string;
  categoryIds?: string[];
  categories?: string[];
  color: string;
  colors?: Array<{ name: string; hex?: string }>;
  sizes?: string[];
  swatch?: string;
  images: string[];
  imageRecords?: CatalogImage[];
  tag: string;
  description: string;
  price?: number;
  active?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

export type ProductInput = {
  name: string;
  categoryId: string;
  categoryIds?: string[];
  colors?: Array<{ name: string; hex?: string }>;
  sizes?: string[];
  brand: string;
  description: string;
  colorLabel: string;
  tag: string;
  price?: number;
  active?: boolean;
  sortOrder?: number;
};
