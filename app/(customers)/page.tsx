import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { cache } from "@/lib/cache";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { QueryResult } from "pg";
import { Suspense } from "react";

const getNewestProducts = cache(
  async () => {
    connectDB();
    const productArray = (await pool.query(`
    SELECT *
    from products
    LEFT JOIN orders on orders.productId = products.id
    WHERE products.isAvailableForPurchase = true
  `)) as QueryResult<Product>;

    const products = productArray?.rows;
    if (products.length === 0) return undefined;
    return products;
  },
  ["/", "getNewestProducts"],
  { revalidate: 60 * 60 * 12 }
);

const getMostPopularProducts = cache(
  async () => {
    connectDB();
    const productArray = (await pool.query(`
  SELECT *
  from products
  LEFT JOIN orders on orders.productId = products.id
  WHERE products.isAvailableForPurchase = true
`)) as QueryResult<Product>;

    const products = productArray?.rows;
    if (products.length === 0) return undefined;
    return products;
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 12 }
);

export default async function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        title="Most Popular"
        products={getMostPopularProducts ?? []}
      />
      <ProductGridSection title="Newest" products={getNewestProducts ?? []} />
    </main>
  );
}

async function ProductGridSection({
  title,
  products,
}: {
  title: string;
  products: () => Promise<Product[] | undefined>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
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
          <ProductSuspense products={products} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  products,
}: {
  products: () => Promise<Product[] | undefined>;
}) {
  return ((await products()) as Product[]).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
