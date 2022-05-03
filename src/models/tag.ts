import { refValidator } from "../utils/validators";
import mongoose, { Model } from "mongoose";
import { Tag } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const TagSchema = new mongoose.Schema<Tag>(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Missing category"],
      validate: {
        validator: async (value: string) => await refValidator(model, value),
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

TagSchema.post("save", UniqueErrorRaiser);

const model: Model<Tag> = mongoose.model<Tag>("Tag", TagSchema);
export default model;
