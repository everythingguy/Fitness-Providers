import mongoose, { PaginateModel } from "mongoose";
import { Category as CategoryType } from "../@types/models";
import Tag from "./tag";
import { UniqueErrorRaiser } from "../utils/errors";
import Pagination from "mongoose-paginate-v2";
import AggregatePaginate from "mongoose-aggregate-paginate-v2";

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

CategorySchema.plugin(AggregatePaginate);
CategorySchema.plugin(Pagination);

CategorySchema.method("getTags", async function (this: CategoryType) {
    return await Tag.find({ category: this._id });
});

CategorySchema.post("remove", function (res, next) {
    Tag.remove({ category: this._id }).exec();
    next();
});

CategorySchema.post("save", UniqueErrorRaiser);
CategorySchema.post("updateOne", UniqueErrorRaiser);

export const Category: PaginateModel<CategoryType, unknown, unknown> =
    mongoose.model<CategoryType, PaginateModel<CategoryType>>(
        "Category",
        CategorySchema
    );

export default Category;
