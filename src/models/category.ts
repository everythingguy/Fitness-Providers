import mongoose from "mongoose";
import { Category as CategoryType } from "../@types/models";
import Tag from "./tag";
import { UniqueErrorRaiser } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const CategorySchema = new mongoose.Schema<CategoryType>(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [30, "Name has max length of 30"],
            required: [true, "Missing name"],
            unique: true
        }
    },
    {
        collection: "categories",
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.__v;
                delete ret.id;
            },
            getters: true,
            virtuals: true
        }
    }
);

CategorySchema.method("getTags", async function (this: CategoryType) {
    return await Tag.find({ category: this._id });
});

CategorySchema.post("remove", async function (res, next) {
    const tags = await this.getTags();

    for (const tag of tags) {
        Tag.findByIdAndRemove(tag).exec();
    }

    next();
});

CategorySchema.post("save", UniqueErrorRaiser);
CategorySchema.post("updateOne", UniqueErrorRaiser);

export const Category: mongoose.Model<CategoryType> =
    mongoose.model<CategoryType>("Category", CategorySchema);

export default Category;
