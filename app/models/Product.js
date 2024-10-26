import mongoose, {model, Schema, models} from "mongoose";

const ProductSchema = new Schema({
    category: {type:mongoose.Types.ObjectId, ref: 'Category', required: true},
    title: {type: String, required: true},
    slug: {type: String},
    images: [{type: Object}],
    price: {type: Number},
    offerPrice: {type: Number},
    description: {type: String},
    mainAttributes: [{type: Object}],
    extraAttributes: [{type: Object}]
}, {
    timestamps: true,
});

export const Product = models?.Product || model('Product', ProductSchema);