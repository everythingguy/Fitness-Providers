import mongoose, { PaginateModel } from "mongoose";
import validator from "validator";
import { LiveSession as LiveSessionType, Recurring } from "../@types/models";
import { WeekDays } from "../@types/enums";
import { refValidator } from "../utils/validators";
import Session from "./session";
import Pagination from "mongoose-paginate-v2";
import { UniqueErrorRaiser, ValidationError } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const RecurringSchema = new mongoose.Schema<Recurring>({
    weekDays: {
        type: [String],
        enum: WeekDays,
        required: [true, "Missing weekDays"]
    },
    frequency: {
        type: Number,
        min: [1, "Frequency cannot be less than one"],
        max: [20, "Frequency cannot be greater than twenty"],
        validate: [
            (value: any) => {
                if (typeof value === "number")
                    return validator.isInt(value.toString());
                else return false;
            },
            "Frequency must be an integer"
        ],
        default: 1
    }
});

const LiveSessionSchema = new mongoose.Schema<LiveSessionType>(
    {
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: [true, "Missing session"],
            unique: true,
            validate: {
                validator: async (value: string) =>
                    await refValidator(Session, value),
                message: ({ value }: { value: string }) =>
                    `Session (${value}) not found`
            }
        },
        beginDateTime: {
            type: Date,
            required: [true, "Missing beginDateTime"],
            validate: [
                (value: Date) => {
                    return value.getTime() > Date.now();
                },
                "You cannot create a event in the past"
            ]
        },
        endDateTime: {
            type: Date,
            required: [true, "Missing endDateTime"]
        },
        recurring: {
            type: RecurringSchema,
            default: null
        }
    },
    {
        collection: "liveSessions",
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

LiveSessionSchema.plugin(Pagination);

LiveSessionSchema.post("validate", function (this: LiveSessionType, doc, next) {
    if (this.beginDateTime > this.endDateTime) {
        const errorMsg = "The event must start before it ends";
        next(
            new ValidationError(errorMsg, {
                beginDateTime: new Error(errorMsg),
                endDateTime: new Error(errorMsg)
            })
        );
    } else next();
});

LiveSessionSchema.post("save", UniqueErrorRaiser);
LiveSessionSchema.post("updateOne", UniqueErrorRaiser);
LiveSessionSchema.post("findOneAndUpdate", UniqueErrorRaiser);

LiveSessionSchema.post(
    "save",
    async function (this: LiveSessionType, doc: LiveSessionType, next) {
        await Session.findByIdAndUpdate(this.session, {
            liveSession: this._id
        });

        next();
    }
);

LiveSessionSchema.post("remove", async function (res, next) {
    try {
        await Session.findByIdAndUpdate(this.session, { liveSession: null });
        // eslint-disable-next-line no-empty
    } catch (error) {}

    next();
});

export const LiveSession: PaginateModel<LiveSessionType, unknown, unknown> =
    mongoose.model<LiveSessionType, PaginateModel<LiveSessionType>>(
        "LiveSession",
        LiveSessionSchema
    );

export default LiveSession;
