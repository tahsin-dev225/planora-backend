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


const updateMyReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await reviewService.updateMyReview(req.body, userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Review updated successfully",
    data: result,
    success: true
  })
})

const getMyReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await reviewService.getMyReview(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Review fetched successfully",
    data: result,
    success: true
  })
})

const getReviewByEventId = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.getReviewByEventId(req.params.eventId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Review fetched successfully",
    data: result,
    success: true
  })
})

export const reviewController = {
  createReview,
  updateMyReview,
  getMyReview,
  getReviewByEventId
}