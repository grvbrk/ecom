"use server";

import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { QueryResult } from "pg";

export async function userOrderExists(
  email: string | undefined,
  productId: number
) {
  connectDB();
  const orderArray = (await pool.query(
    `
    SELECT *
    from orders
    RIGHT JOIN users on orders.userId = users.id
    WHERE orders.productId = $1 AND users.email = $2
  `,
    [productId, email]
  )) as QueryResult<Order>;

  const order = orderArray?.rows[0];
  if (!order) {
    return false;
  }
  return true;
}
