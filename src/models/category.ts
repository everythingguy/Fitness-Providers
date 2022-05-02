import mongoose, { Model } from "mongoose";
import { Category } from "../@types/models";
import Tag from "./tag";
import { UniqueErrorRaiser } from "../utils/errors";

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

CategorySchema.pre("remove", function (next) {
  for (const tag of this.tags) {
    Tag.findByIdAndRemove(tag._id).exec();
  }
  next();
});

CategorySchema.post("save", UniqueErrorRaiser);

const model: Model<Category> = mongoose.model("Category", CategorySchema);
export default model;
