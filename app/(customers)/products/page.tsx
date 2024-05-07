import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { cache } from "@/lib/cache";
import { QueryResult } from "pg";
import { Suspense } from "react";

const getAllProducts = cache(
  async () => {
    connectDB();
    const productArray = (await pool.query(`
      SELECT *
      from products
      WHERE products.isAvailableForPurchase = true
      ORDER BY name
    `)) as QueryResult<Product>;

    const products = productArray?.rows;
    if (products.length === 0) return undefined;
    return products;
  },
  ["/products", "getAllProducts"],
  { revalidate: 60 * 60 * 12 }
);

export default function Products() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductsSuspense />
      </Suspense>
    </div>
  );
}

async function ProductsSuspense() {
  const products = await getAllProducts();
  if (!products) return <h1>Not found</h1>;
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
