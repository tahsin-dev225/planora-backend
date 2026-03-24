import { Router } from "express";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../midlewere/validateRequest";
import { participantValidation } from "./participant.validation";
import { participantController } from "./participant.controller";


const router = Router();

router.post("/create-participant",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(participantValidation.createParticipantValidation),
  participantController.createParticipant)

router.patch("/updateMyParticipant",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(participantValidation.updateMyParticipantValidation),
  participantController.updateMyParticipant)

export const participantRouter = router;