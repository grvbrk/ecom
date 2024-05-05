import { cloudinary } from "@/lib/cloudinary";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  // TBD...
}
