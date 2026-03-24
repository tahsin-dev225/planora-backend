import { z } from "zod";

const createReviewValidation = z.object({
  body: z.object({
    eventId: z.string(),
    rating: z.number(),
    comment: z.string(),
  }),
});

const updateMyReviewValidation = z.object({
  body: z.object({
    reviewId: z.string(),
    rating: z.number(),
    comment: z.string(),
  }),
});

export const reviewValidation = {
  createReviewValidation,
  updateMyReviewValidation
}