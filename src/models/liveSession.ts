import mongoose, { Model } from "mongoose";
import validator from "validator";
import { LiveSession, WeekDays, Recurring } from "../@types/models";

// debug
// mongoose.set('debug', true);

const RecurringSchema = new mongoose.Schema<Recurring>({
  weekDays: {
    type: [String],
    enum: WeekDays,
    required: [true, "Missing weekDays"],
  },
  frequency: {
    type: Number,
    min: [1, "Frequency cannot be less than one"],
    max: [20, "Frequency cannot be greater than twenty"],
    validate: [validator.isInt, "Frequency must be an integer"],
    default: 1,
  },
});

const LiveSessionSchema = new mongoose.Schema<LiveSession>(
  {
    beginDateTime: {
      type: Date,
      required: [true, "Missing beginDateTime"],
      validate: [
        (value: Date) => {
          return value.getTime() > Date.now();
        },
        "You cannot create a event in the past",
      ],
    },
    endDateTime: {
      type: Date,
      required: [true, "Missing endDateTime"],
    },
    recurring: {
      type: RecurringSchema,
      default: null,
    },
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
      virtuals: true,
    },
  }
);

LiveSessionSchema.pre("validate", function (this: LiveSession, next) {
  if (this.beginDateTime > this.endDateTime)
    next(new Error("The event must start before it ends"));
  else next();
});

const model: Model<LiveSession> = mongoose.model(
  "LiveSession",
  LiveSessionSchema
);
export default model;
