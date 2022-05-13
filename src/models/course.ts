import mongoose, { PaginateModel } from "mongoose";
import { Course } from "../@types/models";
import Tag from "./tag";
import Session from "./session";
import { refValidator } from "../utils/validators";
import Provider from "./provider";
import Pagination from "mongoose-paginate-v2";

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
      validate: {
        validator: async (value: string) => await refValidator(Provider, value),
        message: ({ value }: { value: string }) =>
          `Provider (${value}) not found`,
      },
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: {
          validator: async (value: string) => {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error(`Tag (${value}) not found`);
            if (tag && !tag.appliesToCourse)
              throw new Error("That tag does not apply to courses");
            return true;
          },
        },
      },
    ],
  },
  {
    collection: "courses",
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

CourseSchema.plugin(Pagination);

CourseSchema.pre("remove", function (next) {
  Session.remove({ course: this._id }).exec();
  next();
});

CourseSchema.virtual("getSessions", async function (this: Course) {
  return await Session.find({ course: this._id });
});

const model: mongoose.PaginateModel<Course, {}, {}> = mongoose.model<
  Course,
  PaginateModel<Course>
>("Course", CourseSchema);

export default model;
