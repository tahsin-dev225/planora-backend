import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHalpers/AppError";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;

  switch (user.role) {
    case Role.SUPER_ADMIN:
      statsData = await getSuperAdminStatsData();
      break;
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.USER:
      statsData = await getUserStatsData(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }

  return statsData;
}



const getSuperAdminStatsData = async () => {
  const totalUsers = await prisma.user.count();
  const totalEvents = await prisma.event.count();
  const totalParticipants = await prisma.participant.count();
  const totalPayments = await prisma.payment.count();

  return {
    totalUsers,
    totalEvents,
    totalParticipants,
    totalPayments,
  };
}

const getAdminStatsData = async () => {
  const totalEvents = await prisma.event.count();
  const totalParticipants = await prisma.participant.count();
  const totalPayments = await prisma.payment.count();

  return {
    totalEvents,
    totalParticipants,
    totalPayments,
  };
}

const getUserStatsData = async (user: IRequestUser) => {
  const totalEvents = await prisma.event.count();
  const totalParticipants = await prisma.participant.count();
  const totalPayments = await prisma.payment.count();

  return {
    totalEvents,
    totalParticipants,
    totalPayments,
  };
}

export const statsService = {
  getDashboardStatsData,
}