import mongoose, { PaginateModel } from "mongoose";
import { Course as CourseType } from "../@types/models";
import Tag from "./tag";
import Session from "./session";
import { refValidator } from "../utils/validators";
import Provider from "./provider";
import Address from "./address";
import Pagination from "mongoose-paginate-v2";
import { fileRemover } from "../utils/s3";

// debug
// mongoose.set('debug', true);

const CourseSchema = new mongoose.Schema<CourseType>(
    {
        name: {
            type: String,
            trim: true,
            maxLength: [50, "Name has max length of 50"],
            required: [true, "Missing name"]
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            validate: {
                validator: async (value: string) =>
                    await refValidator(Address, value),
                message: ({ value }: { value: string }) =>
                    `Address (${value}) not found`
            }
        },
        description: {
            type: String,
            trim: true,
            required: [true, "Missing description"]
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: [true, "Missing provider"],
            validate: {
                validator: async (value: string) =>
                    await refValidator(Provider, value),
                message: ({ value }: { value: string }) =>
                    `Provider (${value}) not found`
            }
        },
        image: {
            type: String,
            trim: true,
            default: null
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
                            throw new Error(
                                "That tag does not apply to courses"
                            );
                        return true;
                    }
                }
            }
        ]
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
            virtuals: true
        }
    }
);

CourseSchema.plugin(Pagination);

CourseSchema.post("remove", function (res, next) {
    Session.remove({ course: this._id }).exec();
    next();
});

CourseSchema.pre("updateOne", fileRemover("course"));
CourseSchema.pre("findOneAndUpdate", fileRemover("course"));
CourseSchema.post("remove", fileRemover("course", true));

CourseSchema.virtual("getSessions", async function (this: CourseType) {
    return await Session.find({ course: this._id });
});

export const Course: PaginateModel<CourseType, unknown, unknown> =
    mongoose.model<CourseType, PaginateModel<CourseType>>(
        "Course",
        CourseSchema
    );

export default Course;
