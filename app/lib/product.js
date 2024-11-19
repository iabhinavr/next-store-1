import { mongooseConnect } from "./mongoose";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

export async function insertProduct(productDetails) {

    mongooseConnect();

    if (!productDetails.category ||
        !productDetails.title) {
        return false;
    }

    try {
        const product = await Product.create(productDetails);

        if (!product) {
            return null;
        }
        return product;
    }
    catch (error) {
        return null;
    }

}

export async function findProduct(slug) {
    mongooseConnect();
    const product = await Product.findOne({ slug: slug }).exec();
    return product;
}

export async function findProductById(_id) {
    mongooseConnect();
    const product = await Product.findOne({ _id }).exec();
    return product;
}

export async function listProducts(searchParams = null) {
    
    try {

        const limit = searchParams?.get('limit') || 10;
        const page = searchParams?.get('page') || 1;
        const category = searchParams?.get('category') || null;
        const searchTerm = searchParams?.get('searchTerm') || null;

        let sortField;

        switch(searchParams?.get("sortField")) {
            case "title":
                sortField = "title";
                break;
            case "date":
                sortField = "createdAt";
                break;
            default:
                sortField = "createdAt";
        }

        let sortOrder = searchParams?.get("sortOrder") == 'ASC' ? 1 : -1;
        let sortBy = {[sortField]: sortOrder};

        let offset = (page - 1) * limit;

        let products;

        mongooseConnect();

        if(category) {
            const categorySlugs = category.split(",");
            
            const categories = await Category.find({slug: {$in: categorySlugs }}).exec();

            const categoryIds = categories.map((c) => (c._id.toString()));

            products = await Product.find({ category: {$in: categoryIds }}).populate('category').sort(sortBy).skip(offset).limit(limit).exec();

        }
        else if(searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            products = await Product.find({ title: {$regex: regex }}).populate('category').sort(sortBy).skip(offset).limit(limit).exec();
        }
        else {
            products = await Product.find().populate('category').sort(sortBy).skip(offset).limit(limit).exec();
        }

        return products;

    } catch (error) {
        // Handle any errors that occur during the search
        console.error(error);
        throw error;
    }
}

export async function updateProduct(_id, productDetails) {
    mongooseConnect();
    try {
        const product = await Product.findOneAndUpdate({ _id }, productDetails, { new: true });
    
        if (!product) {
          return null;
        }
    
        return product;
      } catch (error) {
            console.error(error);
            throw error;
      }
}

export async function deleteProduct(_id) {
    try {
        const result = await Product.deleteOne({ _id: _id });
        return result;
    }
    catch(error) {
        return false;
    }
}

export async function getProductsCount(searchParams = null) {

    try {

        mongooseConnect();

        const category = searchParams?.get('category') || null;
        const searchTerm = searchParams?.get('searchTerm') || null;

        let count = 0;

        if(category) {
            const categorySlugs = category.split(",");

            const categories = await Category.find({slug: {$in: categorySlugs }}).exec();
            const categoryIds = categories.map((c) => (c._id.toString()));

            count = await Product.find({ category: {$in: categoryIds }}).countDocuments().exec();
            return count;
        }
        else if(searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            count = await Product.find({ title: {$regex: regex }}).countDocuments().exec();
            return count;
        }

        count = await Product.find().countDocuments().exec();
        
        return count;
    }
    catch(error) {
        return false;
    }
}