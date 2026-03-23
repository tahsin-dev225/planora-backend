import express from "express";
import { authRouter } from "../module/auth/auth.route";
import { eventRouter } from "../module/event/event.route";

const router = express.Router();

router.use("/auth", authRouter)
router.use("/event", eventRouter)

export const IndexRoutes = router;