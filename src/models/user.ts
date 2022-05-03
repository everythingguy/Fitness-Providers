import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { User } from "../@types/models";
import Provider from "./provider";
import { UniqueErrorRaiser } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const UserSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      validate: [
        (value: string) => {
          return value.split(" ").length === 2;
        },
        "Please enter a first and last name",
      ],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Invalid email address"],
      unique: true,
    },
    username: {
      type: String,
      trim: true,
      maxLength: [30, "Username has max length of 30"],
      required: [true, "Username is required"],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      minLength: [5, "Password must be at least 5 digits long"],
      required: [true, "Password is required"],
    },
    tokenVersion: {
      type: Number,
      trim: true,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "users",
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.id;
      },
      getters: true,
      virtuals: true,
    },
  }
);

UserSchema.virtual("firstName").get(function (this: User) {
  return this.name.split(" ")[0];
});

UserSchema.virtual("lastName").get(function (this: User) {
  return this.name.split(" ")[1];
});

UserSchema.pre("save", async function (next) {
  if (this.isSuperAdmin) this.isAdmin = true;
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.pre("remove", function (next) {
  Provider.remove({ user: this._id }).exec();
  next();
});

UserSchema.post("save", UniqueErrorRaiser);

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const model: Model<User> = mongoose.model<User>("User", UserSchema);
export default model;
