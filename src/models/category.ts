import mongoose, { Model } from "mongoose";
import { Category } from "../@types/models";

// debug
// mongoose.set('debug', true);

const CategorySchema = new mongoose.Schema<Category>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: [30, "Name has max length of 30"],
      required: [true, "Missing name"],
      unique: [true, "Category already exists"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
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
      virtuals: true,
    },
  }
);

const model: Model<Category> = mongoose.model("Category", CategorySchema);
export default model;
