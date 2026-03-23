import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { reviewService } from "./review.service";
import { Request, Response } from "express";


const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await reviewService.createReview(req.body, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    message: "Review created successfully",
    data: result,
    success: true
  })
})

export const reviewController = {
  createReview
}