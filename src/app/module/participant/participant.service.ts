import status from "http-status";
import { prisma } from "../../lib/prisma";
import { ICreateParticipant, IUpdateParticipant } from "./participant.interface";
import AppError from "../../errorHalpers/AppError";
import { ParticipantStatus } from "../../../generated/prisma/enums";


// create participant. user will join to event if the event is public then status will be approved and if the event is private then status will be pending

// public event means anyone can join the event
// private event means people can request to join the event and need organiger approval

// public + free event means anyone can join the event and status will be approved
// public + paid event means anyone can join the event with payment and status will be pending

// private + free event means people user will request to join the event and status will be pending

// private + paid event means people request to join the event and status will be pending if organiger approve then the status then user need to pay for the event

// join event
const joinEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const alreadyJoined = await prisma.participant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (alreadyJoined) {
    throw new AppError(status.BAD_REQUEST, "You already joined/requested this event");
  }

  let participantStatus: any = "PENDING";

  // logic
  if (event.type === "PUBLIC" && !event.isPaid) {
    participantStatus = "APPROVED";
  }

  if (event.type === "PUBLIC" && event.isPaid) {
    participantStatus = "NEED_PAYMENT";
  }

  if (event.type === "PRIVATE" && !event.isPaid) {
    participantStatus = "PENDING";
  }

  if (event.type === "PRIVATE" && event.isPaid) {
    participantStatus = "PENDING"; // later NEED_PAYMENT by organizer
  }

  const participant = await prisma.participant.create({
    data: {
      userId,
      eventId,
      status: participantStatus,
    },
  });

  return {
    message: "Request processed",
    participant,
  };
};

// for paid event approval
const makeNeedPayment = async (participantId: string, userId: string) => {

  const isOrganizerId = await prisma.participant.findUnique({
    where: { id: participantId },
    select: {
      event: {
        select: {
          organizerId: true,
        },
      },
    },
  });

  const organizerId = isOrganizerId?.event?.organizerId;

  if (organizerId !== userId) {
    throw new AppError(404, "You are not organizer of this event");
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { event: true },
  });

  if (!participant) {
    throw new AppError(404, "Participant not found");
  }

  let newStatus: any = "PENDING";

  if (participant.event.isPaid) {
    newStatus = "NEED_PAYMENT";
  }

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: {
      status: newStatus,
    },
  });

  return updated;
};

const updateMyParticipantApproval = async (payload: IUpdateParticipant, userId: string) => {
  const result = await prisma.participant.update({
    where: {
      id: payload.participantId,
      userId: userId,
    },
    data: {
      status: payload.status,
    },
  });
  return result;
}

const getMyParticipant = async (userId: string) => {
  const result = await prisma.participant.findMany({
    where: {
      userId: userId,
    },
    include: {
      event: {
        include: {
          organizer: true,
        },
      },
    },
  });
  return result;
}

const getMyPrivatePaidEvent = async (userId: string) => {
  const result = await prisma.participant.findMany({
    where: {
      userId: userId,
      event: {
        type: "PRIVATE",
        isPaid: true,
      },
      status: "PENDING",
    },
    include: {
      event: {
        include: {
          organizer: true,
        },
      },
    },
  });
  return result;
}

const getParticipantByEventId = async (eventId: string) => {
  const result = await prisma.participant.findMany({
    where: {
      eventId: eventId,
    },
    include: {
      user: true,
    },
  });
  return result;
}

export const participantService = {
  joinEvent,
  makeNeedPayment,
  updateMyParticipantApproval,
  getMyParticipant,
  getMyPrivatePaidEvent,
  getParticipantByEventId
}