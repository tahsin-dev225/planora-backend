import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../midlewere/validateRequest";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post("/create-review",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(reviewValidation.createReviewValidation),
  reviewController.createReview)

router.patch("/updateMyReview",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(reviewValidation.updateMyReviewValidation),
  reviewController.updateMyReview)

router.get("/getMyReview",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  reviewController.getMyReview)

router.get("/getReviewByEventId/:eventId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  reviewController.getReviewByEventId)

export const reviewRouter = router;