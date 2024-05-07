import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { cache } from "@/lib/cache";
import { notFound } from "next/navigation";
import { QueryResult } from "pg";
import Stripe from "stripe";
import CheckoutForm from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const getSingleProduct = cache(
  async (id: string) => {
    connectDB();
    const productArray = (await pool.query(
      `
      SELECT *
      from products
      WHERE id = $1
    `,
      [id]
    )) as QueryResult<Product>;

    const product = productArray?.rows[0];
    if (!product) return undefined;
    return product;
  },
  ["/products", "getAllProducts"],
  { revalidate: 60 * 60 * 12 }
);

export default async function PurchasePage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = await getSingleProduct(productId);
  if (!product) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceincents,
    currency: "INR",
    metadata: { productId: product.id },
  });

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe Failed to create payment intent");
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  );
}
