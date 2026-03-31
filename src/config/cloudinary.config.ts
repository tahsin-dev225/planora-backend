import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../app/errorHalpers/AppError";
import status from "http-status";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
})

export const uploadFileToCloudinary = async (
    file: string,
    folder: string = "images"
): Promise<UploadApiResponse> => {

    if (!file) {
        throw new AppError(status.BAD_REQUEST, "File (base64 or URL) is required for upload.");
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file,
            {
                resource_type: "auto",
                folder: `planora/${folder}`,
                transformation: [
                    { width: 1200, height: 1200, crop: "limit" },
                    { quality: "auto:eco" },
                    { fetch_format: "auto" }
                ]
            },
            (error, result) => {
                if (error) {
                    return reject(
                        new AppError(
                            status.INTERNAL_SERVER_ERROR,
                            error.message || "Failed to upload file to cloudinary"
                        )
                    );
                }
                resolve(result as UploadApiResponse);
            }
        );
    })
}

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1];

            await cloudinary.uploader.destroy(
                publicId, {
                resource_type: "image"
            }
            );

            console.log(`File ${publicId} deleted from cloudinary.`);
        }
    } catch (error) {
        console.log("Error deleting file form cloudinary", error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete file from cloudinary");
    }
}

export const cloudinaryUpload = cloudinary;