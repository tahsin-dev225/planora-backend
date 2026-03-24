import { Router } from "express";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../midlewere/validateRequest";
import { participantValidation } from "./participant.validation";
import { participantController } from "./participant.controller";


const router = Router();

router.post("/join-event",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  // validateRequest(participantValidation.createParticipantValidation),
  participantController.joinEvent)

router.patch("/makeNeedPayment/:participantId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.makeNeedPayment)

router.patch("/updateMyParticipant",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(participantValidation.updateMyParticipantValidation),
  participantController.updateMyParticipant)

router.get("/getMyParticipant",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getMyParticipant)

router.get("/getParticipantByEventId/:eventId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getParticipantByEventId)

export const participantRouter = router;