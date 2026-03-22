import express from "express";
import { authRouter } from "../module/auth/auth.route";

const router = express.Router();

router.use("/auth", authRouter)

export const IndexRoutes = router;