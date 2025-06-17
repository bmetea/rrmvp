"use server";

import { fetchProductsServer } from "@/services/productService";

export async function searchProductsAction(searchTerm: string) {
  try {
    const { products } = await fetchProductsServer(1, 100, searchTerm);
    return { products };
  } catch (error) {
    throw new Error("Failed to search products");
  }
}
