//imports
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import flash from "connect-flash";
import cors from "cors";
import validator from "express-validator";
import "colors";

//local imports
import ConfigType from "./types/config";
const config: ConfigType = require("../config/config.json");
const { BASE_URL } = config;
import mainRouter from "./routers/main";
import { isLoggedIn } from "./controllers/user";
import { getMongoURI } from "./utils/db";

//global variables
var MongoStore = require("connect-mongo")(session);
const app = express();

//middleware
app.use(
  cors({
    origin: BASE_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(flash());
app.use(cookieParser(process.env.SECRET));
app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    },
    store: new MongoStore({ url: getMongoURI() }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  validator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

//serve static files
app.use(express.static(__dirname + "/../client/build"));
app.use(express.static(__dirname + "/../public"));
app.use("/users", isLoggedIn);
app.use("/users", express.static(__dirname + "/../private"));

//ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//router
export var apiPath = "/api/v1";
app.use(apiPath, mainRouter);

//serve react front end
app.get("*", (req, res) => {
  try {
    res.sendFile(path.resolve("client/build/index.html"));
  } catch (e) {
    const err =
      "Error: react app not built, in order to access the app either run 'npm run build' in the client folder or go to port 3000 to work on the app with live changes";
    console.log(err);
    res.send(err);
  }
});

export default app;
