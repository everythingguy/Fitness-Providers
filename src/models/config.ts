import mongoose from "mongoose";
import { Config as ConfigType } from "../@types/models";
import { UniqueErrorRaiser } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const ConfigSchema = new mongoose.Schema<ConfigType>(
    {
        type: {
            type: String,
            trim: true,
            required: [true, "Missing Type"],
            unique: true
        },
        data: {}
    },
    {
        collection: "configs",
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

ConfigSchema.post("save", UniqueErrorRaiser);
ConfigSchema.post("updateOne", UniqueErrorRaiser);

export const Config: mongoose.Model<ConfigType> = mongoose.model<ConfigType>(
    "Config",
    ConfigSchema
);

export default Config;
