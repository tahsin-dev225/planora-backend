import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { participantService } from "./participant.service";


const createParticipant = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.createParticipant(req.body, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    message: "Participant created successfully",
    data: result,
    success: true
  })
})

const updateMyParticipant = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await participantService.updateMyParticipant(req.body, userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Participant updated successfully",
    data: result,
    success: true
  })
})

export const participantController = {
  createParticipant,
  updateMyParticipant
}