import { formatCurrency } from "@/lib/formatter";
import React from "react";
import Image from "next/image";
import Stripe from "stripe";
import { notFound } from "next/navigation";
import { pool } from "@/db";
import { QueryResult } from "pg";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { connectDB } from "@/db/connection";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );

  if (!paymentIntent.metadata.productId) return notFound();

  const productArray = (await pool.query(
    `
    SELECT *
    from products
    WHERE id = $1
  `,
    [paymentIntent.metadata.productId]
  )) as QueryResult<Product>;

  const product = productArray?.rows[0];
  if (!product) return notFound();

  const isSuccess = paymentIntent.status === "succeeded";

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? "Success!" : "Error!"}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagepath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-lg">{formatCurrency(product.priceincents)}</div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

async function createDownloadVerification(productId: number) {
  connectDB;
  const downloadVerificationArray = (await pool.query(
    `
    INSERT INTO createDownloadVerification (productId, expiresAt)
    VALUES ($1, CURRENT_TIMESTAMP + INTERVAL '1 day')
    RETURNING *
  `,
    [productId]
  )) as QueryResult<DownloadVerification>;

  return downloadVerificationArray.rows[0].id;
}
