import mongoose, { Model } from "mongoose";
import validator from "validator";
import { Session } from "../@types/models";
import LiveSession from "./liveSession";

// debug
// mongoose.set('debug', true);

const SessionSchema = new mongoose.Schema<Session>(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Missing course"],
    },
    URL: {
      type: String,
      trim: true,
      validate: [validator.isURL, "Not a valid URL"],
    },
    name: {
      type: String,
      trim: true,
      maxLength: [50, "name has max length of 50"],
    },
    liveSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveSession",
      default: null,
    },
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
      virtuals: true,
    },
  }
);

SessionSchema.pre("remove", function (next) {
  LiveSession.findByIdAndRemove(this.liveSession).exec();
  next();
});

const model: Model<Session> = mongoose.model("Session", SessionSchema);
export default model;
