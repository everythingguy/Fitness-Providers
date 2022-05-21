import { refValidator } from "../utils/validators";
import mongoose, { PaginateModel } from "mongoose";
import { Tag as TagType } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import Category from "./category";
import Pagination from "mongoose-paginate-v2";

// debug
// mongoose.set('debug', true);

const TagSchema = new mongoose.Schema<TagType>(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Missing category"],
            validate: {
                validator: async (value: string) =>
                    await refValidator(Category, value),
                message: ({ value }: { value: string }) =>
                    `Category (${value}) not found`
            },
            index: true
        },
        value: {
            type: String,
            maxLength: [30, "Value has max length of 30"],
            trim: true,
            required: [true, "Missing value"],
            unique: true
        },
        appliesToProvider: {
            type: Boolean,
            default: true
        },
        appliesToCourse: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: "tags",
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

TagSchema.plugin(Pagination);

TagSchema.post("save", UniqueErrorRaiser);
TagSchema.post("updateOne", UniqueErrorRaiser);
TagSchema.post("findOneAndUpdate", UniqueErrorRaiser);

export const Tag: PaginateModel<TagType, unknown, unknown> = mongoose.model<
    TagType,
    PaginateModel<TagType>
>("Tag", TagSchema);

export default Tag;
