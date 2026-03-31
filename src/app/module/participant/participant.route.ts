import { Router } from "express";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../midlewere/validateRequest";
import { participantValidation } from "./participant.validation";
import { participantController } from "./participant.controller";


const router = Router();

router.post("/join-event",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.joinEvent)

// for paid event payment that that got NEED_PAYMENT approval status
router.post("/payForEvent/:participantId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.payForEvent)


router.get("/getMyPrivatePaidEvent",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getMyPrivatePaidEvent)

router.get("/getMyPrivateFreeEvent",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getMyPrivateFreeEvent)

router.patch("/makeNeedPayment/:participantId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.makeNeedPayment)

router.patch("/updateMyParticipant",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(participantValidation.updateMyParticipantValidation),
  participantController.updateMyParticipant)

router.get("/getMyParticipited-events",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getMyParticipant)

router.get("/getParticipantByEventId/:eventId",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getParticipantByEventId)

router.get('/get-need-payment-participants',
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  participantController.getNeedPaymentParticipants)


export const participantRouter = router;