import status from "http-status";
import AppError from "../../errorHalpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAdminUpdateEvent, ICreateEvent, IQuery, IUserUpdateEvent } from "./event.interface"

// model Event {
//   id          String   @id @default(uuid())
//   title       String
//   description String
//   date        DateTime
//   time        String
//   venue       String
//   type   EventType // PUBLIC / PRIVATE
//   fee    Float // 0 = free
//   isPaid Boolean
//   organizerId String
//   organizer   User   @relation("OrganizerEvents", fields: [organizerId], references: [id])
//   participants Participant[]
//   reviews      Review[]
//   payments     Payment[]
//   createdAt DateTime @default(now())
// }


const createEvent = async (payload: ICreateEvent, userId: string) => {

  const result = await prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description,
      date: new Date(payload.date),
      time: payload.time,
      venue: payload.venue,
      banner: payload.banner,
      type: payload.type,
      fee: payload.fee,
      isPaid: payload.fee > 0 ? true : false,
      organizerId: userId,
    }
  })

  return result;
}

const getAllEvents = async (query: IQuery) => {
  const { search, type, upcoming, isPaid, page = "1", limit = "10" } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const whereCondition: any = {};

  if (search) {
    whereCondition.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (type) {
    whereCondition.type = type;
  }

  if (isPaid !== undefined) {
    whereCondition.isPaid = isPaid === "true";
  }

  if (upcoming === "true") {
    whereCondition.date = {
      gte: new Date(),
    };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereCondition,
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.event.count({
      where: whereCondition,
    }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPage: Math.ceil(total / limitNumber),
    },
    data: events,
  };
};

const getFourUpcomingEvent = async () => {
  const result = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 4,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getSingleEvent = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: {
      id
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: true,
    },
  });

  return result;
};

const getMyEvents = async (userId: string) => {
  const result = await prisma.event.findMany({
    where: {
      organizerId: userId
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: true,
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        }
      },
    },
  })

  return result;
}

const updateEvent = async (id: string, payload: IUserUpdateEvent, userId: string) => {

  const isUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  const isEvent = await prisma.event.findUnique({
    where: {
      id
    }
  })

  if (!isUser || !isEvent) {
    throw new AppError(status.NOT_FOUND, "User or Event not found");
  }

  if (isUser.id !== isEvent.organizerId) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to update this event");
  }

  const result = await prisma.event.update({
    where: {
      id
    },
    data: {
      title: payload.title,
      description: payload.description,
    }
  })

  return result;
}

const deleteEvent = async (id: string) => {
  const result = await prisma.event.delete({
    where: {
      id
    }
  })

  return result;
}

const updateAdminEvent = async (id: string, payload: IAdminUpdateEvent) => {
  const result = await prisma.event.update({
    where: {
      id
    },
    data: {
      type: payload.type,
    }
  })

  return result;
}

export const eventService = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
  updateAdminEvent,
  getFourUpcomingEvent
}