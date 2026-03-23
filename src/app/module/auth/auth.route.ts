import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../midlewere/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/me", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), authController.getMe)
router.post("/logout", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), authController.logOutUser)
router.post("/refresh-token", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), authController.getNewToken)
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), authController.deleteUser)

export const authRouter = router;