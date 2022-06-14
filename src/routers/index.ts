import express from "express";
import userRouter from "./user";
import providerRouter from "./provider";
import addressRouter from "./address";
import courseRouter from "./course";
import sessionRouter from "./session";
import liveSessionRouter from "./liveSession";
import categoryRouter from "./category";
import tagRouter from "./tag";
import paypalRouter from "./paypal";

export const router = express.Router();

router.use("/users", userRouter);
router.use("/providers", providerRouter);
router.use("/addresses", addressRouter);
router.use("/courses", courseRouter);
router.use("/sessions", sessionRouter);
router.use("/live-sessions", liveSessionRouter);
router.use("/categories", categoryRouter);
router.use("/tags", tagRouter);
router.use("/paypal", paypalRouter);

router.route("/health").get((req: express.Request, res: express.Response) => {
    res.send({ success: true });
});

export default router;

export * from "./user";
export * from "./provider";
export * from "./address";
export * from "./course";
export * from "./session";
export * from "./liveSession";
export * from "./category";
export * from "./tag";
