import mongoose, { Model } from "mongoose";
import { Course } from "../@types/models";
import Tag from "./tag";

// debug
// mongoose.set('debug', true);

const CourseSchema = new mongoose.Schema<Course>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: [50, "Name has max length of 50"],
      required: [true, "Missing name"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Missing description"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "Missing provider"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: [
          async (value: string) => {
            const tag = await Tag.findById(value);
            return tag.appliesToCourse;
          },
          "That tag does not apply to courses",
        ],
      },
    ],
  },
  {
    collection: "courses",
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

const model: Model<Course> = mongoose.model("Course", CourseSchema);
export default model;
