import status from "http-status";
import AppError from "../../errorHalpers/AppError";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.inteface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";

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

  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (isUserExist.status === UserStatus.BANNED) {
    throw new AppError(status.FORBIDDEN, "User is banned");
  }

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

const deleteUser = async (id: string) => {
  const result = await prisma.user.update({
    where: {
      id
    },
    data: {
      isDeleted: true,
      status: UserStatus.BANNED
    }
  })

  return result;
}

const getAllUser = async (query: string) => {
  const page = query || "1"
  const limit = "8"
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limitNumber,
      include: {
        events: true,
        participants: true,
        reviews: true
      }
    }),
    prisma.user.count()
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
    data: users,
  };
}





const makeAdmin = async (id: string) => {
  // check user exist or not
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })
  if (user?.role === Role.SUPER_ADMIN) {
    throw new AppError(status.FORBIDDEN, "Super admin cannot be made admin");
  }
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const result = await prisma.user.update({
    where: {
      id,
      status: UserStatus.ACTIVE
    },
    data: {
      role: user.role === Role.ADMIN ? Role.USER : Role.ADMIN
    }
  })
  return result;
}

export const authService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  logOutUser,
  deleteUser,
  getAllUser,
  makeAdmin
}