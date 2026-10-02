import { client } from "@/sanity/lib/client";
import { allProductsQuery, productBySlugQuery } from "@/sanity/queries/products";

import { Product } from "@/types/product";

type ProductRecording = Product["recordings"][number]
type RawProduct = Omit<Product, "recordings"> & {recordings?: Array<ProductRecording | null>}

export async function getProducts(): Promise<Product[]> {
  const products = await client.fetch<RawProduct[]>(allProductsQuery)
  return products.map(normalizeProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await client.fetch<RawProduct | null>(productBySlugQuery, {slug})
  return product ? normalizeProduct(product) : null
}

function normalizeProduct(product: RawProduct): Product {
  return {
    ...product,
    recordings: (product.recordings || []).filter((recording): recording is ProductRecording => Boolean(recording?._id)),
  }
}
