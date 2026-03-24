import { z } from "zod";

const createParticipantValidation = z.object({
  eventId: z.string(),
});

const updateMyParticipantValidation = z.object({
  participantId: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "NEED_PAYMENT"]),
});

export const participantValidation = {
  createParticipantValidation,
  updateMyParticipantValidation
}