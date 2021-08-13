import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../types/models";

//debug
//mongoose.set('debug', true);

const UserSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        trim: true,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Please add a email"]
    },
    username: {
        type: String,
        trim: true,
        required: [true, "Please add a username"]
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Please add a hashed password"]
    }
}, { collection: "users" });

UserSchema.pre('save', async function(next)  {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isValidPassword = async function(password: string) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);