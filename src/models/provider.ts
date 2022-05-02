import mongoose, { Model } from "mongoose";
import validator from "validator";
import { Provider, Address } from "../@types/models";
import Tag from "./tag";
import Course from "./course";
import { UniqueErrorRaiser } from "../utils/errors";

// debug
// mongoose.set('debug', true);

const AddressSchema = new mongoose.Schema<Address>({
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
    validate: [validator.isPostalCode, "Invalid zip"],
  },
  country: {
    type: String,
    trim: true,
    maxLength: [60, "Country has max length of 60"],
    required: [true, "Missing country"],
  },
});

const ProviderSchema = new mongoose.Schema<Provider>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
      unique: [true, "That user is already a provider"],
    },
    address: {
      type: AddressSchema,
      required: [true, "Missing address"],
    },
    isEnrolled: {
      type: Boolean,
      default: false,
      required: [true, "Missing isEnrolled"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Missing phone"],
      validate: [validator.isMobilePhone, "Invalid phone number"],
    },
    bio: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      validate: [validator.isURL, "Invalid URL"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: [
          async (value: string) => {
            const tag = await Tag.findById(value);
            return tag.appliesToProvider;
          },
          "That tag does not apply to providers",
        ],
      },
    ],
  },
  {
    collection: "providers",
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

ProviderSchema.pre("remove", function (next) {
  Course.remove({ provider: this._id }).exec();
  next();
});

ProviderSchema.post("save", UniqueErrorRaiser);

ProviderSchema.virtual("courses").get(async function (this: Provider) {
  return await Course.find({ provider: this._id });
});

const model: Model<Provider> = mongoose.model("Provider", ProviderSchema);
export default model;
