import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { User } from "../@types/models";

// debug
// mongoose.set('debug', true);

const UserSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Missing name"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Missing email"],
      validate: [validator.isEmail, "Invalid email address"],
      unique: [true, "Email already in use"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Missing username"],
      unique: [true, "Username already in use"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Missing password"],
    },
    tokenVersion: {
      type: Number,
      trim: true,
      default: 0,
    },
  },
  {
    collection: "users",
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const model: Model<User> = mongoose.model("User", UserSchema);
export default model;
