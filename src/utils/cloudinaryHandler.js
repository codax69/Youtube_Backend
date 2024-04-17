import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_KEY_SECRET,
});

const cloudinaryUpload = async (localPath) => {
  try {
    if (!localPath) return null;
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    console.log(response)
    return response;
  } catch (error) {
    fs.unlinkSync(localPath);
    return null;
  }
};
export {cloudinaryUpload}
