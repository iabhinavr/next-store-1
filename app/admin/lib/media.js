import { mongooseConnect } from "./mongoose";
import { Media } from "../models/Media";

export async function insertImage(origPath, webpPath) {
    mongooseConnect();

    try {
        const media = await Media.create({ origPath, webpPath });

        if(!media) {
            return null;
        }
        return media;
    }
    catch(error) {
        return null;
    }
    
}

export async function findImage(origPath) {
    mongooseConnect();
    const file = await Media.findOne({ origPath }).exec();
    return file;
}

export async function findImageById(_id) {
    mongooseConnect();
    const file = await Media.findOne({ _id }).exec();
    return file;
}

export async function listImages(limit, skip = 0) {
    mongooseConnect();
    
    try {
        const images = await Media.find().sort({createdAt: -1}).skip(skip).limit(limit).exec();
        return images;
    } catch (error) {
        // Handle any errors that occur during the search
        console.error(error);
        throw error;
    }
}

export async function deleteMedia(_id) {
    try {
        const result = await Media.deleteOne({ _id: _id });
        return result;
    }
    catch(error) {
        return false;
    }
}