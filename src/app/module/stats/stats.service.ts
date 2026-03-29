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

  const eventsPerMonthBar = await getEventsPerMonth();

  return {
    totalEvents,
    toatalUsers,
    totalParticipants,
    totalRevenue,
    eventsPerMonthBar
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

// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           <StatCard number="500+" label="Events Successfully Managed" />
//           <StatCard number="50k+" label="Attendees Satisfied" />
//           <StatCard number="15+" label="Years of Industry Experience" />
//           <StatCard number="100%" label="Commitment to Excellence" />
//         </div>


const getBannerStatsData = async () => {
  const totalEvents = await prisma.event.count();
  const totalParticipants = await prisma.participant.count({
    where: {
      status: ParticipantStatus.APPROVED
    }
  });
  const totalOrganizer = await prisma.user.count({
    where: {
      role: Role.ADMIN
    }
  });

  return {
    totalEvents,
    totalParticipants,
    totalOrganizer,
  };
}


// const getPieChartData = async () => {
//   const appointmentStatusDistribution = await prisma.appointment.groupBy({
//     by: ["status"],
//     _count: {
//       id: true
//     },
//   });

//   const formatedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ _count, status }) => ({
//     status: status,
//     count: _count.id
//   }))

//   return formatedAppointmentStatusDistribution
// }

// const getBarChartData = async () => {
//   interface AppointmentCountByMonth {
//     month: Date;
//     count: BigInt;
//   }
//   const appointmentCountByMonth: AppointmentCountByMonth[] = await prisma.$queryRaw`
//   SELECT 
//     DATE_TRUNC('month', "createdAt") AS month,
//     CAST(COUNT(*) AS INTEGER) AS count
//   FROM "appointments"
//   GROUP BY month
//   ORDER BY month ASC;
//   `;

//   return appointmentCountByMonth;
// }

const getEventsPerMonth = async () => {
  const events = await prisma.event.findMany({
    select: {
      createdAt: true,
    },
  });

  // 12 months initialize
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString("en", { month: "short" });

    return {
      month,
      total: 0,
    };
  });

  // count events per month
  events.forEach((event) => {
    const monthIndex = new Date(event.createdAt).getMonth();
    monthlyStats[monthIndex].total += 1;
  });

  return monthlyStats;
};


export const statsService = {
  getDashboardStatsData,
  getBannerStatsData
}