// imports
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoSanitize from "express-mongo-sanitize";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import flash from "connect-flash";
import cors from "cors";
import "colors";

// local imports
import mainRouter from "./routers";
import { ReqUser } from "./controllers/user";
import { ReqProvider } from "./controllers/provider";
import { isLoggedIn } from "./utils/permissions";
import { getMongoURI } from "./utils/db";
import { Request } from "./@types/request";
import { capitalize } from "./utils/string";

// global variables
const app = express();

// middleware
app.use(
    cors({
        origin: process.env.BASE_URL,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true
    })
);

app.use(express.json());
app.use(
    bodyParser.urlencoded({
        extended: true
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
            maxAge: 15 * 24 * 60 * 60 * 1000
        },
        store: MongoStore.create({
            mongoUrl: getMongoURI(),
            collectionName: "cookie-sessions"
        })
    })
);

app.use(
    mongoSanitize({
        onSanitize: ({ req, key }: any) => {
            // eslint-disable-next-line no-console
            console.log(
                `SANITIZED: This request[${key}] is sanitized`,
                req[key]
            );
        }
    })
);

app.use(ReqUser);
app.use(ReqProvider);

// serve static files
app.use(express.static(__dirname + "/../public"));
app.use("/users", isLoggedIn, express.static(__dirname + "/../private"));

// ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// logger
app.use(
    async (req: Request, res: express.Response, next: express.NextFunction) => {
        if (req.user)
            // eslint-disable-next-line no-console
            console.log(`${req.user.username} ${req.method} ${req.url}`);
        // eslint-disable-next-line no-console
        else console.log(`${req.method} ${req.url}`);
        next();
    }
);

// router
export const apiPath = "/api/v1";
app.use(apiPath, mainRouter);

// serve react front end
app.get("*", (req, res) => {
    res.render("index", {
        title: `${capitalize(process.env.PROVIDER_TYPE)} Providers`
    });
});

export default app;
