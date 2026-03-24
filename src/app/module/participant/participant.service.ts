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
  // 🔍 event check
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  // ❌ already joined check
  const alreadyJoined = await prisma.participant.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (alreadyJoined) {
    throw new AppError(
      status.BAD_REQUEST,
      "You already joined/requested this event"
    );
  }

  let participant_Status: ParticipantStatus = ParticipantStatus.PENDING;

  // 🧠 logic based on event type
  if (event.type === "PUBLIC" && !event.isPaid) {
    participant_Status = ParticipantStatus.APPROVED;
  }

  // 🧱 create participant
  const participant = await prisma.participant.create({
    data: {
      userId,
      eventId,
      status: participant_Status,
    },
  });

  // 💰 payment case (only for public paid)
  if (event.type === "PUBLIC" && event.isPaid) {
    return {
      message: "Payment required to join this event",
      participant,
      requiresPayment: true,
    };
  }

  // 🔵 private paid → approve first then payment later
  if (event.type === "PRIVATE" && event.isPaid) {
    return {
      message: "Join request sent. Wait for approval, then complete payment.",
      participant,
      requiresApproval: true,
    };
  }

  return {
    message:
      participant_Status === "APPROVED"
        ? "Successfully joined the event"
        : "Join request sent. Wait for approval",
    participant,
  };
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
  updateMyParticipantApproval,
  getMyParticipant,
  getParticipantByEventId
}