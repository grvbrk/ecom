import { pool } from "@/db";
import PageHeader from "../../../_components/PageHeader";
import ProductForm from "../../_components/ProductForm";
import { QueryResult } from "pg";
import { connectDB } from "@/db/connection";

export default async function EditProductPage({
  params: { id },
}: {
  params: { id: number };
}) {
  connectDB();
  const productResponse = (await pool.query(
    `
    SELECT *
    FROM Products
    WHERE id = $1
  `,
    [id]
  )) as QueryResult<Product>;

  const product = productResponse?.rows[0];
  console.log("Product", product, id);
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
