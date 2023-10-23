import { mongooseConnect } from "./mongoose";
import { Media } from "../models/Media";

export async function insertImage(origPath, webpPath) {
    mongooseConnect();
    await Media.create({ origPath, webpPath });
}

export async function findImage(origPath) {
    mongooseConnect();
    const file = await Media.findOne({ origPath }).exec();
    return file;
}

export async function listImages(limit) {
    mongooseConnect();
    
    try {
        const images = await Media.find().sort({createdAt: -1}).limit(limit).exec();
        return images;
    } catch (error) {
        // Handle any errors that occur during the search
        console.error(error);
        throw error;
    }
}