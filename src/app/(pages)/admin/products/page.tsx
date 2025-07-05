import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchProductsServer } from "@/domains/products/services/product.service";
import { ProductsClient } from "./products-client";
import { isUserAdmin } from "@/domains/admin/actions/admin.actions";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { userId } = await auth();

  // Check if the user is the admin
  if (!userId || !(await isUserAdmin())) {
    redirect("/");
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search;
  const pageSize = 10;

  const { products, total, totalPages } = await fetchProductsServer(
    page,
    pageSize,
    search
  );

  return (
    <ProductsClient
      products={products}
      total={total}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      search={search}
    />
  );
}
