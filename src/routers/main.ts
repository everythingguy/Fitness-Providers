import express from "express";
import userRouter from "./user";
import providerRouter from "./provider";
import courseRouter from "./course";
import sessionRouter from "./session";
import liveSessionRouter from "./liveSession";
import categoryRouter from "./category";
import tagRouter from "./tag";
import { capitalize } from "../utils/string";

const router = express.Router();

router.use("/users", userRouter);
router.use("/providers", providerRouter);
router.use("/courses", courseRouter);
router.use("/sessions", sessionRouter);
router.use("/live-sessions", liveSessionRouter);
router.use("/categories", categoryRouter);
router.use("/tags", tagRouter);

router.route("/health").get((req: express.Request, res: express.Response) => {
  res.send({ success: true });
});

// serve react front end
router.get("*", (req, res) => {
  res.render("index", {
    title: `${capitalize(process.env.PROVIDER_TYPE)} Providers`,
  });
});

export default router;
