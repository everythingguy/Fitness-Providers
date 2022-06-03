import mongoose from "mongoose";
import { EmailConfirmationCode as EmailConfirmationCodeType } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";

// debug
// mongoose.set('debug', true);

// TODO: on email confirmed delete all codes belonging to that user

const EmailConfirmationCodeSchema =
    new mongoose.Schema<EmailConfirmationCodeType>(
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
                },
                unique: true
            },
            code: {
                type: String,
                required: true
            }
        },
        {
            collection: "emailConfirmationCodes",
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

EmailConfirmationCodeSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

EmailConfirmationCodeSchema.post("save", UniqueErrorRaiser);
EmailConfirmationCodeSchema.post("updateOne", UniqueErrorRaiser);

export const EmailConfirmationCode: mongoose.Model<EmailConfirmationCodeType> =
    mongoose.model<EmailConfirmationCodeType>(
        "EmailConfirmationCode",
        EmailConfirmationCodeSchema
    );

export default EmailConfirmationCode;
