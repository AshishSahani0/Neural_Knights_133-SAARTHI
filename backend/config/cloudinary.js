// src/util/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config({quiet:true});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary with advanced options.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {Object} options - Cloudinary upload options (e.g., { folder: 'my_folder', public_id: 'my_image' }).
 * @returns {Promise<Object>} - The Cloudinary upload result.
 */
export const uploadToCloudinary = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const defaultOptions = { resource_type: "auto" };
        const uploadOptions = { ...defaultOptions, ...options };
        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(fileBuffer);
    });
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the file on Cloudinary.
 * @returns {Promise<Object>} - The Cloudinary deletion result.
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error;
    }
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * @param {string} url - The secure URL of the file from Cloudinary.
 * @returns {string} - The public ID.
 */
export const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    // Return the public ID with the correct folder path
    return `${parts[parts.length - 2]}/${publicId}`;
};