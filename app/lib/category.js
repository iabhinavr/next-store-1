import { mongooseConnect } from "./mongoose";
import { Category } from "../models/Category";

export async function insertCategory(categoryDetails) {

    mongooseConnect();

    if(!categoryDetails?.title ||
        !categoryDetails?.slug) {
            return false;
        }

    try {
        const category = await Category.create({ title: categoryDetails.title, slug: categoryDetails.slug, description: categoryDetails?.description || '' });
        
        if(!category) {
            return null;
        }
        return category;
    }
    catch(error) {
        return null;
    }
    

}

export async function findCategory(slug) {
    mongooseConnect();
    const category = await Category.findOne({ slug }).exec();
    return category;
}

export async function findCategoryById(_id) {
    mongooseConnect();
    const category = await Category.findOne({ _id }).exec();
    return category;
}

export async function listCategories(limit, skip = 0) {
    mongooseConnect();
    
    try {
        const categories = await Category.find().sort({createdAt: -1}).skip(skip).limit(limit).exec();
        return categories;
    } catch (error) {
        // Handle any errors that occur during the search
        console.error(error);
        throw error;
    }
}

export async function updateCategory(_id, categoryDetails) {
    mongooseConnect();
    try {
        const category = await Category.findOneAndUpdate({ _id }, categoryDetails, { new: true });
    
        if (!category) {
          return null;
        }
    
        return category;
      } catch (error) {
            console.error(error);
            throw error;
      }
}

export async function deleteCategory(_id) {
    try {
        const result = await Category.deleteOne({ _id: _id });
        return result;
    }
    catch(error) {
        return false;
    }
}