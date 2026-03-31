import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { statsController } from "./stats.controller";

const router = Router();

router.get("/getStats",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  statsController.getStats);

router.get('/get-banner-stats',
  statsController.getBannerStats)

export const statsRouter = router;