import {model, Schema, models} from "mongoose";

const MediaSchema = new Schema({
    origPath: {type: String, required: true},
    webpPath: {type: String, required: true},
}, {
    timestamps: true,
});

export const Media = models?.Media || model('Media', MediaSchema);