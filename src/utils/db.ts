import mongoose from "mongoose";
import "colors";

export function getMongoURI(suffix = "-testing") {
    let MONGO_URI =
        "mongodb://" +
        process.env.DB_USERNAME +
        ":" +
        process.env.DB_PASSWORD +
        "@" +
        process.env.DB_IP +
        ":" +
        process.env.DB_PORT +
        "/" +
        process.env.DB_NAME +
        "?authSource=" +
        process.env.DB_AUTHSOURCE;
    if (
        process.env.CI !== undefined &&
        process.env.CI.toLowerCase() === "true" &&
        process.env.NODE_ENV === "test"
    )
        MONGO_URI = "mongodb://mongo:27017/" + process.env.DB_NAME + suffix;
    else if (
        process.env.CI !== undefined &&
        process.env.CI.toLowerCase() === "true"
    )
        MONGO_URI = "mongodb://mongo:27017/" + process.env.DB_NAME;
    else if (process.env.NODE_ENV === "test")
        MONGO_URI =
            "mongodb://" +
            process.env.DB_USERNAME +
            ":" +
            process.env.DB_PASSWORD +
            "@" +
            process.env.DB_IP +
            ":" +
            process.env.DB_PORT +
            "/" +
            process.env.DB_NAME +
            suffix +
            "?authSource=" +
            process.env.DB_AUTHSOURCE;

    return MONGO_URI;
}

// connect database
export default async function connectDB(uri: string) {
    try {
        const conn = await mongoose.connect(uri);

        // eslint-disable-next-line no-console
        console.log(`DB Connected: ${conn.connection.host}`.green.underline);
        return conn.connection;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err.message.red);
        process.exit(1);
    }
}
