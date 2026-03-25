import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await authService.registerUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      message: "User regiterd successfully ",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      },
      success: true
    })
  }
)

const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await authService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "User logged in successfully ",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      },
      success: true
    })
  }
)

const getMe = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await authService.getMe(userId as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "User fetched successfully ",
      data: result,
      success: true
    })
  }
)

const getNewToken = catchAsync(
  async (req: Request, res: Response) => {
    const { refreshToken, sessionToken } = req.cookies;
    const result = await authService.getNewToken(refreshToken, sessionToken);

    const { accessToken, refreshToken: newRefreshToken, sessionToken: newSessionToken } = result;

    tokenUtils.setAccessToken(res, accessToken);
    tokenUtils.setRefreshToken(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, newSessionToken as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "New token generated successfully ",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken: newSessionToken
      },
      success: true
    })
  }
)

const logOutUser = catchAsync(
  async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await authService.logOutUser(betterAuthSessionToken);

    // Clear cookies
    cookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    cookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    cookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    })
  }
)

const deleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await authService.deleteUser(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "User deleted successfully ",
      data: result,
      success: true
    })
  }
)

const getAllUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.getAllUser(req.query);
    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "User fetched successfully ",
      meta: result.meta,
      data: result.data,
      success: true
    })
  }
)

const makeAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await authService.makeAdmin(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      message: "User made admin successfully ",
      data: result,
      success: true
    })
  }
)

export const authController = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  logOutUser,
  deleteUser,
  getAllUser,
  makeAdmin
}