import status from "http-status";
import AppError from "../../errorHalpers/AppError";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.inteface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  })

  if (!data.user) {
    throw new Error("Feiled to register user")
  }

  await prisma.user.update({
    where: {
      id: data.user.id
    },
    data: {
      emailVerified: true
    }
  })


  try {

    // create access token
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    })

    // create refresh token
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    })

    return {
      ...data,
      token: data.token,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id
      }
    })
    throw error;
  }

}

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  })

  if (!data.user) {
    throw new Error("Feiled to login user")
  }

  if (data.user.isDeleted) {
    throw new Error("User is deleted")
  }


  // create access token
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  })

  // create refresh token
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  })

  return {
    ...data,
    token: data.token,
    accessToken,
    refreshToken,
  };
}

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      events: true,
      participants: true,
      reviews: true
    }
  })
  return user;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {

  const isSessionTokenExist = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  })

  if (!isSessionTokenExist) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    email: data.email,
    role: data.role,
    name: data.name,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  })

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    email: data.email,
    role: data.role,
    name: data.name,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  })

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000), // 1 day 
      updatedAt: new Date()
    }
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  }
}


const logOutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  })

  return result;
}


export const authService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  logOutUser
}