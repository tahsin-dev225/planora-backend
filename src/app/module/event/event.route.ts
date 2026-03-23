import { Router } from "express";
import { eventController } from "./event.controller";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../midlewere/validateRequest";
import { eventValidation } from "./event.validation";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { parseBody } from "../../midlewere/parseBody.middlewere";

const router = Router();

router.post("/create-event",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  multerUpload.single("banner"),
  eventController.createEvent)

router.get("/", eventController.getAllEventsController)

router.get("/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  eventController.getSingleEventController)

router.get("/my-events",
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