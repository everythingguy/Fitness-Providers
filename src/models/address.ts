import mongoose from "mongoose";
import { Address } from "../@types/models";
import Provider from "./provider";
import { refValidator } from "../utils/validators";

// debug
// mongoose.set('debug', true);

const AddressSchema = new mongoose.Schema<Address>(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "Missing provider"],
      validate: {
        validator: async (value: string): Promise<boolean> => {
          return await refValidator(Provider, value);
        },
        message: ({ value }: { value: string }) =>
          `Provider (${value}) not found`,
      },
    },
    street1: {
      type: String,
      trim: true,
      maxLength: [50, "street1 has max length of 50"],
      required: [true, "Missing street1"],
    },
    street2: {
      type: String,
      maxLength: [50, "street2 has max length of 50"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      maxLength: [60, "City has max length of 60"],
      required: [true, "Missing city"],
    },
    state: {
      type: String,
      trim: true,
      maxLength: [30, "State has max length of 30"],
      required: [true, "Missing state"],
    },
    zip: {
      type: String,
      trim: true,
      required: [true, "Missing zip"],
    },
    country: {
      type: String,
      trim: true,
      maxLength: [60, "Country has max length of 60"],
      required: [true, "Missing country"],
    },
  },
  {
    collection: "addresses",
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

const model: mongoose.Model<Address> = mongoose.model<Address>(
  "Address",
  AddressSchema
);

export default model;
