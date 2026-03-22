import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import AppError from "../errorHalpers/AppError";
import status from "http-status";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // session token verification
    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token")

    if (!sessionToken) {
      throw new Error("Unauthorized, no session token provided");
    }

    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      })

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentageRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentageRemaining < 20) {
          res.setHeader("X-Refresh-Token", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());

          console.log("Session Expiring soon!");
        }

        if (user.status === UserStatus.BANNED || user.status === UserStatus.INACTIVE) {
          throw new AppError(status.UNAUTHORIZED, "Your account is banned or inactive. Please contact support for more information.");
        }

        if (user.isDeleted) {
          throw new AppError(status.UNAUTHORIZED, "Your account is deleted. Please contact support for more information.");
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
        }

        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role
        }
      }

      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Access token is missing");
      }

    }

    // access token verification
    const accessToken = cookieUtils.getCookie(req, "accessToken");

    if (!accessToken) {
      throw new AppError(status.UNAUTHORIZED, "Access token is missing");
    }

    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

    if (!verifiedToken) {
      throw new AppError(status.UNAUTHORIZED, "Invalid access token");
    }

    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as Role)) {
      throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
    }

    next();
  } catch (error) {
    next(error);
  }
}  