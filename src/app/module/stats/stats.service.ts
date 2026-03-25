import status from "http-status";
import { ParticipantStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
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
  const totalParticipants = await prisma.participant.count({
    where: {
      status: ParticipantStatus.APPROVED
    }
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: PaymentStatus.SUCCESS
    }
  });

  return {
    totalUsers,
    totalEvents,
    totalParticipants,
    totalRevenue,
  };
}

const getAdminStatsData = async () => {
  const totalEvents = await prisma.event.count();
  const totalParticipants = await prisma.participant.count(
    {
      where: {
        status: ParticipantStatus.APPROVED
      }
    }
  );
  const toatalUsers = await prisma.user.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: PaymentStatus.SUCCESS
    }
  });

  return {
    totalEvents,
    toatalUsers,
    totalParticipants,
    totalRevenue,
  };
}

const getUserStatsData = async (user: IRequestUser) => {
  const totalEvents = await prisma.event.count({ where: { organizerId: user.userId } });
  const totalParticipants = await prisma.participant.count({ where: { userId: user.userId } });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: PaymentStatus.SUCCESS,
      userId: user.userId
    }
  });

  return {
    totalEvents,
    totalParticipants,
    totalRevenue,
  };
}

export const statsService = {
  getDashboardStatsData,
}