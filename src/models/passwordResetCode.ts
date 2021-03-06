import mongoose from "mongoose";
import { PasswordResetCode as PasswordResetCodeType } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";

// debug
// mongoose.set('debug', true);

const PasswordResetCodeSchema = new mongoose.Schema<PasswordResetCodeType>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            validate: {
                validator: async (value: string) => {
                    const user = await User.findById(value);
                    if (!user) throw new Error(`User (${value}) not found`);
                    return true;
                }
            }
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            expires: "10m",
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "passwordResetCodes",
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

PasswordResetCodeSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

PasswordResetCodeSchema.post("save", UniqueErrorRaiser);
PasswordResetCodeSchema.post("updateOne", UniqueErrorRaiser);

export const PasswordResetCode: mongoose.Model<PasswordResetCodeType> =
    mongoose.model<PasswordResetCodeType>(
        "PasswordResetCode",
        PasswordResetCodeSchema
    );

export default PasswordResetCode;
