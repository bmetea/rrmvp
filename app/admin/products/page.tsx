import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchProductsServer } from "@/services/productService";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const { userId } = await auth();

  // Check if the user is the admin
  if (userId !== "user_2yHYTl16QkOq9usCZ4GlQY3vW3Y") {
    redirect("/");
  }

  const products = await fetchProductsServer();

  return <ProductsClient products={products} />;
}
