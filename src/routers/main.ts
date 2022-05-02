import express from "express";
import userRouter from "./user";
import providerRouter from "./provider";

const router = express.Router();

router.use("/user", userRouter);
router.use("/providers", providerRouter);

export default router;
