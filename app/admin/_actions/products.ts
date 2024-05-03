"use server";
import { z } from "zod";
import {
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

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

export async function addProduct(formData: FormData) {
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

  // redirect("/admin/products");
}
