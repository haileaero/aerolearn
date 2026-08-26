import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("========================================");
console.log("CLOUDINARY ENVIRONMENT CHECK");
console.log("========================================");
console.log("CLOUD_NAME:", cloudName ? "OK" : "MISSING");
console.log("API_KEY:", apiKey ? "OK" : "MISSING");
console.log("API_SECRET:", apiSecret ? "OK" : "MISSING");
console.log("========================================");

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;