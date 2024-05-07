"use server";
import { z } from "zod";
import {
  deleteFileFromCloudinary,
  deleteImageFromCloudinary,
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size == 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, { message: "Required" }),
  image: imageSchema.refine((file) => file.size > 0, { message: "Required" }),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const { success, error, data } = addSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!success) {
    console.log("Error parsing formdata");
    return error.formErrors.fieldErrors;
  }

  const p1 = uploadImageToCloudinary(data.image);
  const p2 = uploadFileToCloudinary(data.file);
  const [imageUrl, fileUrl] = await Promise.all([p1, p2]);

  try {
    connectDB();
    await pool.query(
      `
      INSERT INTO products (name, priceInCents, filePath, imagePath, description, isAvailableForPurchase)
      VALUES
        ($1, $2, $3, $4, $5, false)
    `,
      [data.name, data.priceInCents, fileUrl, imageUrl, data.description]
    );
    console.log("Product Added Successfully!");
  } catch (error) {
    console.log("Error writing to DB", error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: number,
  isavailableforpurchase: boolean
) {
  connectDB();
  await pool.query(
    `
    UPDATE products
    SET isavailableforpurchase = $1
    WHERE id = $2
  `,
    [isavailableforpurchase, id]
  );

  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteProduct(
  id: number,
  imagePath: string,
  filePath: string
) {
  connectDB();
  const product = await pool.query(
    `
    DELETE
    FROM products
    WHERE id = $1
    RETURNING *
  `,
    [id]
  );

  try {
    const result = await deleteImageFromCloudinary(imagePath);
    console.log("Image deleted", result);
  } catch (error) {
    console.log("Error deleting Image", error);
  }

  try {
    const result = await deleteFileFromCloudinary(filePath);
    console.log("File deleted", result);
  } catch (error) {
    console.log("Error deleting File", error);
  }

  revalidatePath("/");
  revalidatePath("/products");
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: fileSchema.optional(),
});

export async function updateProduct(
  product: Product,
  prevState: unknown,
  formData: FormData
) {
  const { success, error, data } = editSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!success) {
    console.log("Error parsing formdata");
    return error.formErrors.fieldErrors;
  }

  let fileUrl = product.filepath;
  let imageUrl = product.imagepath;
  if (data.file != null && data.file.size > 0) {
    // Delete the old file and upload the new file that we get from data.file
    const p1 = deleteFileFromCloudinary(product.filepath);
    const p2 = deleteImageFromCloudinary(product.imagepath);
    await Promise.all([p1, p2]);
    console.log("Successfully deleted from cloudinary");

    const p3 = uploadImageToCloudinary(data.image as File);
    const p4 = uploadFileToCloudinary(data.file as File);
    const [img, file] = await Promise.all([p3, p4]);
    fileUrl = file as string;
    imageUrl = img as string;
    console.log("Successfully uploaded files to cloudinary");
  }

  try {
    connectDB();
    await pool.query(
      `
      UPDATE Products
      SET name = $1, priceInCents = $2, filePath = $3, imagePath = $4, description = $5
      WHERE id = $6
    `,
      [
        data.name,
        data.priceInCents,
        fileUrl,
        imageUrl,
        data.description,
        product.id,
      ]
    );
    console.log("Product Updated Successfully!");
  } catch (error) {
    console.log("Error writing to DB", error);
  }

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}
