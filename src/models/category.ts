import mongoose, { PaginateModel } from "mongoose";
import { Category } from "../@types/models";
import Tag from "./tag";
import { UniqueErrorRaiser } from "../utils/errors";
import { refValidator } from "../utils/validators";
import Pagination from "mongoose-paginate-v2";

// debug
// mongoose.set('debug', true);

const CategorySchema = new mongoose.Schema<Category>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: [30, "Name has max length of 30"],
      required: [true, "Missing name"],
      unique: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: {
          validator: async (value: string) => await refValidator(Tag, value),
          message: ({ value }: { value: string }) => `Tag (${value}) not found`,
        },
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

CategorySchema.plugin(Pagination);

CategorySchema.pre("remove", function (next) {
  for (const tag of this.tags) {
    Tag.findByIdAndRemove(tag).exec();
  }
  next();
});

CategorySchema.post("save", UniqueErrorRaiser);
CategorySchema.post("updateOne", UniqueErrorRaiser);

const model: mongoose.PaginateModel<Category, {}, {}> = mongoose.model<
  Category,
  PaginateModel<Category>
>("Category", CategorySchema);

export default model;
