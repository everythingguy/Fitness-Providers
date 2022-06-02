import mongoose, { PaginateModel } from "mongoose";
import { Address as AddressType } from "../@types/models";
import Provider from "./provider";
import Course from "./course";
import { refValidator } from "../utils/validators";
import Pagination from "mongoose-paginate-v2";
import fetch from "node-fetch";

// debug
// mongoose.set('debug', true);
const CoordinateSchema = new mongoose.Schema({
    latitude: {
        required: true,
        type: Number,
        max: 90,
        min: 90
    },
    longitude: {
        required: true,
        type: Number,
        max: 180,
        min: 180
    }
});

const AddressSchema = new mongoose.Schema<AddressType>(
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
                    `Provider (${value}) not found`
            }
        },
        street1: {
            type: String,
            trim: true,
            maxLength: [50, "street1 has max length of 50"],
            required: [true, "Missing street1"]
        },
        street2: {
            type: String,
            maxLength: [50, "street2 has max length of 50"],
            trim: true
        },
        city: {
            type: String,
            trim: true,
            maxLength: [60, "City has max length of 60"],
            required: [true, "Missing city"]
        },
        state: {
            type: String,
            trim: true,
            maxLength: [30, "State has max length of 30"],
            required: [true, "Missing state"]
        },
        zip: {
            type: String,
            trim: true,
            required: [true, "Missing zip"]
        },
        country: {
            type: String,
            trim: true,
            maxLength: [60, "Country has max length of 60"],
            required: [true, "Missing country"]
        },
        googlePlaceID: {
            type: String,
            trim: true,
            default: null
        },
        coordinates: {
            type: CoordinateSchema,
            default: null
        }
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
            virtuals: true
        }
    }
);

AddressSchema.plugin(Pagination);

const getGooglePlaceID = async function (this: AddressType) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURI(
        this.street2
            ? `${this.street1} ${this.street2}, ${this.city}, ${this.state} ${this.zip}`
            : `${this.street1} ${this.city}, ${this.state} ${this.zip}`
    )}&key=${process.env.GOOGLE_PLACE_API}&quotaUser=${this.provider}`;

    const resp = await fetch(url);
    const data: any = await resp.json();

    if (data.status === "OK") {
        if (data.results.length > 0) {
            this.googlePlaceID = data.results[0].place_id;
            this.coordinates.latitude = data.results[0].geometry.location.lat;
            this.coordinates.longitude = data.results[0].geometry.location.lng;
        }
    }
};

AddressSchema.pre("save", getGooglePlaceID);
AddressSchema.pre("updateOne", getGooglePlaceID);

// delete ref of address on provider and courses
AddressSchema.post("remove", async function (res, next) {
    try {
        await Provider.findByIdAndUpdate(this.provider, { address: null });
        await Course.updateMany({ location: this._id }, { location: null });
        // eslint-disable-next-line no-empty
    } catch (error) {}

    next();
});

export const Address: PaginateModel<AddressType, unknown, unknown> =
    mongoose.model<AddressType, PaginateModel<AddressType>>(
        "Address",
        AddressSchema
    );

export default Address;
