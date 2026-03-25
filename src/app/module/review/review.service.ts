import status from "http-status";
import { prisma } from "../../lib/prisma";
import { ICreateReview, IUpdateReview } from "./review.interface";
import AppError from "../../errorHalpers/AppError";


const createReview = async (payload: ICreateReview, userId: string) => {
  const { eventId, rating, comment } = payload;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.date > new Date()) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can review only after event is completed"
    );
  }

  // participant check
  const participant = await prisma.participant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (!participant || participant.status !== "APPROVED") {
    throw new AppError(
      status.FORBIDDEN,
      "You must join and be approved to review this event"
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      eventId,
    },
  });

  if (existingReview) {
    throw new AppError(
      status.BAD_REQUEST,
      "You already reviewed this event"
    );
  }

  if (rating < 1 || rating > 5) {
    throw new AppError(
      status.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      eventId,
      rating,
      comment,
    },
  });

  return review;
}

const updateMyReview = async (payload: IUpdateReview, userId: string) => {
  const { reviewId, rating, comment } = payload;

  const getReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!getReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  const event = await prisma.event.findUnique({
    where: { id: getReview.eventId },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.date > new Date()) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can review only after event is completed"
    );
  }

  // participant check
  const participant = await prisma.participant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId: getReview.eventId,
      },
    },
  });

  if (!participant || participant.status !== "APPROVED") {
    throw new AppError(
      status.FORBIDDEN,
      "You must join and be approved to review this event"
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      eventId: getReview.eventId,
    },
  });

  if (!existingReview) {
    throw new AppError(
      status.BAD_REQUEST,
      "You already reviewed this event"
    );
  }

  if (rating < 1 || rating > 5) {
    throw new AppError(
      status.BAD_REQUEST,
      "Rating must be between 1 and 5"
    );
  }

  const review = await prisma.review.update({
    where: {
      id: existingReview.id,
    },
    data: {
      rating,
      comment,
    },
  });

  return review;
}

const getMyReview = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: {
      userId,
    },
  });

  return reviews;
}

const getReviewByEventId = async (eventId: string) => {
  const reviews = await prisma.review.findMany({
    where: {
      eventId,
    },
  });

  return reviews;
}

export const reviewService = {
  createReview,
  updateMyReview,
  getMyReview,
  getReviewByEventId
}