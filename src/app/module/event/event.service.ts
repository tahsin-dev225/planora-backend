import status from "http-status";
import AppError from "../../errorHalpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAdminUpdateEvent, ICreateEvent, IQuery, IUserUpdateEvent } from "./event.interface"



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
  const { search, type, isPaid, page = "1", limit = "10" } = query;

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


  // upcoming by default true
  // whereCondition.date = {
  //   gte: new Date(),
  // };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: whereCondition,
      skip,
      take: limitNumber,
      orderBy: {
        date: "desc",
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

const getAllEventsOnlyPagination = async (page: string,) => {
  const limit = 8
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;



  const [events, total] = await Promise.all([
    prisma.event.findMany({
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

    prisma.event.count(),
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


// get four featured events up to date
const getFeaturedEvents = async () => {
  const result = await prisma.event.findMany({
    where: {
      isFeatured: true,
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

// make featured only admin can do if makeFeature route hit then event featured will be true and if again hit then event featured will be false 

const makeFeatured = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id
    }
  })

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const result = await prisma.event.update({
    where: {
      id
    },
    data: {
      isFeatured: !event.isFeatured,
    }
  })
  return result;
}

export const eventService = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  getMyEvents,
  getFeaturedEvents,
  updateEvent,
  deleteEvent,
  updateAdminEvent,
  getFourUpcomingEvent,
  makeFeatured,
  getAllEventsOnlyPagination
}