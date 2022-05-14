import mongoose, { PaginateModel } from "mongoose";
import validator from "validator";
import { refValidator } from "../utils/validators";
import { Provider } from "../@types/models";
import Tag from "./tag";
import Course from "./course";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";
import Address from "./address";
import Pagination from "mongoose-paginate-v2";

// debug
// mongoose.set('debug', true);

const ProviderSchema = new mongoose.Schema<Provider>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
      unique: true,
      validate: {
        validator: async (value: string): Promise<boolean> => {
          return await refValidator(User, value);
        },
        message: ({ value }: { value: string }) => `User (${value}) not found`,
      },
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      validate: {
        validator: async (value: string): Promise<boolean> => {
          return await refValidator(Address, value);
        },
        message: ({ value }: { value: string }) =>
          `Address (${value}) not found`,
      },
    },
    isEnrolled: {
      type: Boolean,
      default: false,
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
    image: {
      type: String,
      trim: true,
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        validate: {
          validator: async (value: string) => {
            const tag = await Tag.findById(value);
            if (!tag) throw new Error(`Tag (${value}) not found`);
            if (tag && !tag.appliesToProvider)
              throw new Error("That tag does not apply to providers");
            return true;
          },
        },
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

ProviderSchema.plugin(Pagination);

ProviderSchema.pre("remove", function (next) {
  // TODO: remove addresses
  Course.remove({ provider: this._id }).exec();
  next();
});

ProviderSchema.post("save", UniqueErrorRaiser);
ProviderSchema.post("updateOne", UniqueErrorRaiser);
ProviderSchema.post("findOneAndUpdate", UniqueErrorRaiser);

ProviderSchema.method("getCourses", async function (this: Provider) {
  return await Course.find({ provider: this._id });
});

const model: PaginateModel<Provider, {}, {}> = mongoose.model<
  Provider,
  PaginateModel<Provider>
>("Provider", ProviderSchema);

export default model;
