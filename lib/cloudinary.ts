import { v2 as cloudinary } from "cloudinary";
import { toNodeReadableStream } from "./toNodeReadableStream";
import { resolve } from "dns";
import { rejects } from "assert";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadImageToCloudinary(image: File) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecom",
      },
      (err, result) => {
        if (err) reject(err);
        resolve(result?.secure_url ?? "");
      }
    );
    const imageStream = toNodeReadableStream(image.stream());
    imageStream.pipe(uploadStream);
  });
}

function uploadFileToCloudinary(file: File) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecom",
        resource_type: "raw",
      },
      (err, result) => {
        if (err) reject(err);
        resolve(result?.secure_url ?? "");
      }
    );
    const fileStream = toNodeReadableStream(file.stream());
    fileStream.pipe(uploadStream);
  });
}

// async function convertImageToBase64Encoding(file: File) {
//   const fileBuffer = await file.arrayBuffer();
//   const fileArray = Array.from(new Uint8Array(fileBuffer));
//   const fileData = Buffer.from(fileArray);
//   return fileData.toString("base64");
// }

export { cloudinary, uploadImageToCloudinary, uploadFileToCloudinary };
