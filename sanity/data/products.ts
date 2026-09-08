import { client } from "@/sanity/lib/client";
import { allProductsQuery } from "@/sanity/queries/products";

import { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  return client.fetch<Product[]>(allProductsQuery);
}

// export async function getFeaturedProducts() {
//   return client.fetch(featuredProductsQuery);
// }

// export async function getProduct(slug: string) {
//   return client.fetch(productBySlugQuery, { slug });
// }