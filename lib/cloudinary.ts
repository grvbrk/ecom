import { v2 as cloudinary } from "cloudinary";
import { toNodeReadableStream } from "./toNodeReadableStream";

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

function deleteImageFromCloudinary(imagePath: string) {
  const id = getIdFromCloudinaryURL(imagePath);
  console.log("ImageId", id);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      id,
      { resource_type: "image" },
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}

function deleteFileFromCloudinary(filePath: string) {
  const id = getIdFromCloudinaryURL(filePath);
  console.log("FileId", id);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(id, { resource_type: "raw" }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

function getIdFromCloudinaryURL(url: string) {
  const parts = url.split("/");
  const index = parts.findIndex((part) => part.startsWith("v"));
  if (index < 0) throw new Error("Invalid id");

  const lastElString = parts[parts.length - 1].split(".")[0];
  parts.pop();
  parts.push(lastElString);

  return parts.slice(index + 1).join("/");
}

// async function convertImageToBase64Encoding(file: File) {
//   const fileBuffer = await file.arrayBuffer();
//   const fileArray = Array.from(new Uint8Array(fileBuffer));
//   const fileData = Buffer.from(fileArray);
//   return fileData.toString("base64");
// }

export {
  cloudinary,
  uploadImageToCloudinary,
  uploadFileToCloudinary,
  deleteImageFromCloudinary,
  deleteFileFromCloudinary,
};
