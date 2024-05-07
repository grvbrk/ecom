import { pool } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { QueryResult } from "pg";

export default async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  const dataArray = (await pool.query(
    `
    SELECT p.filePath, p.name
    FROM DownloadVerification dv
    JOIN Product p ON dv.productId = p.id
    WHERE dv.id = $1 AND dv.expiresAt > CURRENT_TIMESTAMP;
  `,
    [downloadVerificationId]
  )) as QueryResult<{ filePath: string; name: string }>;

  const data = dataArray?.rows[0];

  if (!data) {
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    );
  }

  // Give a download link (same as admin download)
  // TBD...
}
