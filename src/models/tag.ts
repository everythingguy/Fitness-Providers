import { refValidator } from "../utils/validators";
import mongoose, { PaginateModel } from "mongoose";
import { Tag } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import Category from "./category";
import Pagination from "mongoose-paginate-v2";

// debug
// mongoose.set('debug', true);

const TagSchema = new mongoose.Schema<Tag>(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Missing category"],
      validate: {
        validator: async (value: string) => await refValidator(Category, value),
        message: ({ value }: { value: string }) =>
          `Category (${value}) not found`,
      },
    },
    value: {
      type: String,
      maxLength: [30, "Value has max length of 30"],
      trim: true,
      required: [true, "Missing value"],
      unique: true,
    },
    appliesToProvider: {
      type: Boolean,
      required: [true, "Missing appliesToProvider"],
      default: true,
    },
    appliesToCourse: {
      type: Boolean,
      required: [true, "Missing appliesToCourse"],
      default: true,
    },
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
      virtuals: true,
    },
  }
);

TagSchema.plugin(Pagination);

TagSchema.post("save", UniqueErrorRaiser);
TagSchema.post("updateOne", UniqueErrorRaiser);

const model: mongoose.PaginateModel<Tag, {}, {}> = mongoose.model<
  Tag,
  PaginateModel<Tag>
>("Tag", TagSchema);

export default model;
