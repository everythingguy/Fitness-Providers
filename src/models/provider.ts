import mongoose, { PaginateModel } from "mongoose";
import validator from "validator";
import { refValidator } from "../utils/validators";
import { Provider as ProviderType } from "../@types/models";
import Tag from "./tag";
import Course from "./course";
import { UniqueErrorRaiser } from "../utils/errors";
import User from "./user";
import Address from "./address";
import Pagination from "mongoose-paginate-v2";
import { fileRemover } from "../utils/s3";
import PayPalManager from "../utils/paypal";

// debug
// mongoose.set("debug", true);

const ProviderSchema = new mongoose.Schema<ProviderType>(
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
                message: ({ value }: { value: string }) =>
                    `User (${value}) not found`
            }
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
            validate: {
                validator: async (value: string): Promise<boolean> => {
                    return await refValidator(Address, value);
                },
                message: ({ value }: { value: string }) =>
                    `Address (${value}) not found`
            }
        },
        isEnrolled: {
            type: Boolean,
            default: false
        },
        phone: {
            type: String,
            trim: true,
            required: [true, "Missing phone"],
            validate: [
                (value: string | null) =>
                    value === null ? true : validator.isMobilePhone(value),
                "Invalid phone number"
            ],
            default: null
        },
        bio: {
            type: String,
            trim: true,
            default: null
        },
        website: {
            type: String,
            trim: true,
            validate: [
                (value: string | null) =>
                    value === null ? true : validator.isURL(value),
                "Invalid URL"
            ],
            default: null
        },
        image: {
            type: String,
            trim: true,
            default: null
        },
        subscription: {
            type: String,
            trim: true,
            unique: true,
            required: false
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
                            throw new Error(
                                "That tag does not apply to providers"
                            );
                        return true;
                    }
                }
            }
        ]
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
            virtuals: true
        }
    }
);

ProviderSchema.plugin(Pagination);

ProviderSchema.post("remove", function (res, next) {
    Address.remove({ provider: this._id }).exec();
    Course.remove({ provider: this._id }).exec();
    next();
});

ProviderSchema.pre("save", async function (next) {
    if (this.isModified("subscription")) {
        if (PayPalManager.access_token.length === 0)
            await PayPalManager.setAccessToken();

        const subscription = await PayPalManager.getSubscription(
            this.subscription
        );

        this.isEnrolled = true;

        if (
            subscription.status !== "ACTIVE" ||
            this._id.toString() !== subscription.custom_id
        )
            this.isEnrolled = false;
    }
    next();
});

ProviderSchema.pre(
    "updateOne",
    function (this: any, next: mongoose.CallbackWithoutResultAndOptionalError) {
        const id = this._conditions._id;
        const set = this._update;
        const update = this.getUpdate();
        const subscriptionID: string | null =
            update.$set.subscription || update.subscription;

        if (subscriptionID) {
            const promises: Promise<any>[] = [];

            if (PayPalManager.access_token.length === 0)
                promises.push(PayPalManager.setAccessToken());

            Promise.all(promises).then(() => {
                PayPalManager.getSubscription(subscriptionID).then(
                    (subscription) => {
                        set.isEnrolled = true;

                        if (
                            subscription.status !== "ACTIVE" ||
                            id !== subscription.custom_id
                        )
                            set.isEnrolled = false;

                        next();
                    }
                );
            });
        } else next();
    }
);

ProviderSchema.post("save", UniqueErrorRaiser);
ProviderSchema.post("updateOne", UniqueErrorRaiser);

ProviderSchema.pre("save", fileRemover<ProviderType>("Provider"));
ProviderSchema.pre(
    "updateOne",
    fileRemover<ProviderType>("Provider", false, true)
);
ProviderSchema.post("remove", fileRemover<ProviderType>("Provider", true));

ProviderSchema.method("getCourses", async function (this: ProviderType) {
    return await Course.find({ provider: this._id });
});

export const Provider: PaginateModel<ProviderType, unknown, unknown> =
    mongoose.model<ProviderType, PaginateModel<ProviderType>>(
        "Provider",
        ProviderSchema
    );

export default Provider;
