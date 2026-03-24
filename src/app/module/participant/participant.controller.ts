import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { participantService } from "./participant.service";


const joinEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.joinEvent(req.body.eventId, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    message: "Participant created successfully",
    data: result,
    success: true
  })
})

const getMyPrivatePaidEvent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.getMyPrivatePaidEvent(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant fetched successfully",
    data: result,
    success: true
  })
})

const makeNeedPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }
  const result = await participantService.makeNeedPayment(req.params.participantId as string, userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant updated successfully to need-payment",
    data: result,
    success: true
  })
})

const updateMyParticipant = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.updateMyParticipantApproval(req.body, userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant updated successfully",
    data: result,
    success: true
  })
})

const getMyParticipant = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.getMyParticipant(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant fetched successfully",
    data: result,
    success: true
  })
})

const getParticipantByEventId = catchAsync(async (req: Request, res: Response) => {
  const result = await participantService.getParticipantByEventId(req.params.eventId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant fetched successfully",
    data: result,
    success: true
  })
})

export const participantController = {
  joinEvent,
  makeNeedPayment,
  updateMyParticipant,
  getMyParticipant,
  getMyPrivatePaidEvent,
  getParticipantByEventId
}