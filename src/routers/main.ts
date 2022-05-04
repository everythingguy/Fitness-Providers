import express from "express";
import userRouter from "./user";
import providerRouter from "./provider";
import courseRouter from "./course";

const router = express.Router();

router.use("/user", userRouter);
router.use("/providers", providerRouter);
router.use("/courses", courseRouter);

export default router;
