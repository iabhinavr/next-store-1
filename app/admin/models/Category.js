import {model, Schema, models} from "mongoose";

const CategorySchema = new Schema({
    title: {type: String, required: true},
    slug: {type: String, required: true},
    description: {type: String},
    attributes: [{type: Object}]
}, {
    timestamps: true,
});

export const Category = models?.Category || model('Category', CategorySchema);