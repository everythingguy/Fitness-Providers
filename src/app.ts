import app from "./server";
import connectDB, { getMongoURI } from "./utils/db";

//connect to the database
const conn = connectDB(getMongoURI());

//express server
const port = process.env.PORT || 5000;
app.set("port", port);

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`.yellow.underline);
});

process.on("SIGTERM", async () => {
  await shutdown();
});

process.on("SIGINT", async () => {
  await shutdown();
});

async function shutdown() {
  console.log("Shutting Down...");
  server.close((err) => {
    if (err) console.log(err);
  });
  await (await conn).close();
  process.exit(0);
}
