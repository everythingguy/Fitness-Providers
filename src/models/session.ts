import { refValidator } from "../utils/validators";
import mongoose, { PaginateModel } from "mongoose";
import validator from "validator";
import { Session as SessionType } from "../@types/models";
import Course from "./course";
import LiveSession from "./liveSession";
import Pagination from "mongoose-paginate-v2";
import { fileRemover } from "../utils/s3";

// debug
// mongoose.set('debug', true);

const SessionSchema = new mongoose.Schema<SessionType>(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Missing course"],
            validate: {
                validator: async (value: string) =>
                    await refValidator(Course, value),
                message: ({ value }: { value: string }) =>
                    `Course (${value}) not found`
            }
        },
        URL: {
            type: String,
            trim: true,
            validate: [validator.isURL, "Not a valid URL"]
        },
        name: {
            type: String,
            trim: true,
            required: [true, "Missing name"],
            maxLength: [50, "name has max length of 50"]
        },
        image: {
            type: String,
            trim: true,
            default: null
        },
        liveSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LiveSession",
            default: null,
            validate: {
                validator: async (value: string) =>
                    await refValidator(LiveSession, value),
                message: ({ value }: { value: string }) =>
                    `Live Session (${value}) not found`
            }
        }
    },
    {
        collection: "sessions",
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

SessionSchema.plugin(Pagination);

SessionSchema.post("remove", function (res, next) {
    LiveSession.findByIdAndRemove(this.liveSession).exec();
    next();
});

SessionSchema.pre("save", fileRemover<SessionType>("Session"));
SessionSchema.pre(
    "updateOne",
    fileRemover<SessionType>("Session", false, true)
);
SessionSchema.post("remove", fileRemover<SessionType>("Session", true));

export const Session: PaginateModel<SessionType, unknown, unknown> =
    mongoose.model<SessionType, PaginateModel<SessionType>>(
        "Session",
        SessionSchema
    );

export default Session;
