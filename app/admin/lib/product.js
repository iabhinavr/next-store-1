import { mongooseConnect } from "./mongoose";
import { Product } from "../models/Product";

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

export async function listProducts(limit, skip = 0) {
    mongooseConnect();
    
    try {
        const categories = await Product.find().sort({createdAt: -1}).skip(skip).limit(limit).exec();
        return categories;
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

export async function getProductsCount() {
    mongooseConnect();

    try {
        const count = await Product.find().countDocuments().exec();
        if(count) {
            return count;
        }
        return false;
    }
    catch(error) {
        return false;
    }
}