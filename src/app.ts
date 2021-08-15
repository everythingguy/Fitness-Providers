import app from "./server";
import connectDB, { getMongoURI } from "./utils/db";

//connect to the database
connectDB(getMongoURI());

//express server
const port = process.env.PORT || 5000;
app.set("port", port);

app.listen(port, () => {
  console.log(`API listening on port ${port}`.yellow.underline);
});
