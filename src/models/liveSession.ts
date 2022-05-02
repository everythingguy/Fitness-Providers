import mongoose, { Model } from "mongoose";
import validator from "validator";
import { LiveSession } from "../@types/models";

// debug
// mongoose.set('debug', true);

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
      weekDays: {
        type: [String],
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
      frequency: {
        type: Number,
        min: [1, "Frequency cannot be less than one"],
        max: [20, "Frequency cannot be greater than twenty"],
        validate: [validator.isInt, "Frequency must be an integer"],
      },
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
