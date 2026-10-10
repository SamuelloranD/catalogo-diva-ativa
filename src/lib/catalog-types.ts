export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
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
  color: string;
  swatch?: string;
  images: string[];
  imageRecords?: CatalogImage[];
  tag: string;
  description: string;
  price?: number;
  active?: boolean;
  sortOrder?: number;
};

export type ProductInput = {
  name: string;
  categoryId: string;
  brand: string;
  description: string;
  colorLabel: string;
  tag: string;
  price?: number;
  active?: boolean;
  sortOrder?: number;
};
