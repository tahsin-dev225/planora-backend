import { Router } from "express";
import { eventController } from "./event.controller";
import { multerUpload } from "../../../config/multer.config";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-event",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  multerUpload.single("banner"),
  eventController.createEvent)

router.get("/", eventController.getAllEventsController)

router.get('/upcoming-events', eventController.getFourUpcomingEvent)

router.get("/get-single-event/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  eventController.getSingleEventController)

router.get("/my-event",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  eventController.getMyEvents)

router.patch("/updateUserEvent/:id",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  eventController.updateEventController)

router.delete("/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.deleteEventController)

router.patch("/updateAdminEvent/:id",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.updateAdminEvent)

export const eventRouter = router;