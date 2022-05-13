import mongoose, { PaginateModel } from "mongoose";
import { PasswordResetCode } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";
import Pagination from "mongoose-paginate-v2";

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

PasswordResetCodeSchema.plugin(Pagination);

PasswordResetCodeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

PasswordResetCodeSchema.post("save", UniqueErrorRaiser);
PasswordResetCodeSchema.post("updateOne", UniqueErrorRaiser);

const model: mongoose.PaginateModel<PasswordResetCode, {}, {}> = mongoose.model<
  PasswordResetCode,
  PaginateModel<PasswordResetCode>
>("PasswordResetCode", PasswordResetCodeSchema);

export default model;
