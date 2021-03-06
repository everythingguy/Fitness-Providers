import "dotenv/config";
import app from "./server";
import connectDB, { getMongoURI } from "./utils/db";

// connect to the database
const conn = connectDB(getMongoURI());

// express server
const port = process.env.PORT || 80;
app.set("port", port);

const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${port}`.yellow.underline);
});

process.on("SIGTERM", async () => {
    await shutdown();
});

process.on("SIGINT", async () => {
    await shutdown();
});

async function shutdown() {
    // eslint-disable-next-line no-console
    console.log("Shutting Down...");
    server.close((err) => {
        // eslint-disable-next-line no-console
        if (err) console.log(err);
    });
    await (await conn).disconnect();
    process.exit(0);
}
