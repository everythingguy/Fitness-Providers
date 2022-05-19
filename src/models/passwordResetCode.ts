import mongoose from "mongoose";
import { PasswordResetCode } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";

// debug
// mongoose.set('debug', true);

const PasswordResetCodeSchema = new mongoose.Schema<PasswordResetCode>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async (value: string) => {
          const user = await User.findById(value);
          if (!user) throw new Error(`User (${value}) not found`);
          return true;
        },
      },
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: "10m",
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "passwordResetCodes",
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

PasswordResetCodeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

PasswordResetCodeSchema.post("save", UniqueErrorRaiser);
PasswordResetCodeSchema.post("updateOne", UniqueErrorRaiser);
PasswordResetCodeSchema.post("findOneAndUpdate", UniqueErrorRaiser);

const model: mongoose.Model<PasswordResetCode> =
  mongoose.model<PasswordResetCode>(
    "PasswordResetCode",
    PasswordResetCodeSchema
  );

export default model;
