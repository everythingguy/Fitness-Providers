import mongoose from "mongoose";

export async function refValidator(
    model: mongoose.Model<any>,
    value: string
): Promise<boolean> {
    try {
        if (value === null) return true;
        const found = await model.findById(value);
        if (found) return true;
        else return false;
    } catch (e) {
        return false;
    }
}
