import express from "express";
import { authRouter } from "../module/auth/auth.route";
import { eventRouter } from "../module/event/event.route";
import { participantRouter } from "../module/participant/participant.route";
import { reviewRouter } from "../module/review/review.route";

const router = express.Router();

router.use("/auth", authRouter)
router.use("/event", eventRouter)
router.use("/participant", participantRouter)
router.use("/review", reviewRouter)
// router.use("/payment", paymentRouter)

export const IndexRoutes = router;