import mongoose, { PaginateModel } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { User as UserType } from "../@types/models";
import Provider from "./provider";
import { UniqueErrorRaiser } from "../utils/errors";
import Pagination from "mongoose-paginate-v2";
import EmailConfirmationCode from "./emailConfirmationCode";

// debug
// mongoose.set('debug', true);

const UserSchema = new mongoose.Schema<UserType>(
    {
        firstName: {
            type: String,
            trim: true,
            required: [true, "First name is required"],
            minLength: 1
        },
        lastName: {
            type: String,
            trim: true,
            required: [true, "Last name is required"],
            minLength: 1
        },
        email: {
            type: String,
            trim: true,
            required: [true, "Email is required"],
            validate: [validator.isEmail, "Invalid email address"],
            unique: true
        },
        emailConfirmed: {
            type: Boolean,
            default: false
        },
        username: {
            type: String,
            trim: true,
            maxLength: [30, "Username has a max length of 30"],
            minLength: [3, "Username has a minimum length of 3"],
            required: [true, "Username is required"],
            unique: true
        },
        password: {
            type: String,
            trim: true,
            minLength: [5, "Password must be at least 5 digits long"],
            required: [true, "Password is required"]
        },
        tokenVersion: {
            type: Number,
            trim: true,
            default: 0
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isSuperAdmin: {
            type: Boolean,
            default: false
        }
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
            virtuals: true
        }
    }
);

UserSchema.plugin(Pagination);

UserSchema.virtual("name").get(function (this: UserType) {
    return `${this.firstName} ${this.lastName}`;
});

UserSchema.method("getProvider", async function (this: UserType) {
    const provider = await Provider.findOne({ user: this._id });
    if (provider) return provider;
    else return null;
});

UserSchema.pre("save", async function (next) {
    if (this.isSuperAdmin) this.isAdmin = true;
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);
    if (this.isModified("emailConfirmed") && this.emailConfirmed)
        EmailConfirmationCode.remove({ user: this._id }).exec();
    next();
});

UserSchema.post("remove", function (res, next) {
    Provider.remove({ user: this._id }).exec();
    EmailConfirmationCode.remove({ user: this._id }).exec();
    next();
});

UserSchema.post("save", UniqueErrorRaiser);
UserSchema.post("updateOne", UniqueErrorRaiser);

UserSchema.methods.isValidPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

export const User: PaginateModel<UserType, unknown, unknown> = mongoose.model<
    UserType,
    PaginateModel<UserType>
>("User", UserSchema);

export default User;
