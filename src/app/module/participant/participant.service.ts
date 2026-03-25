import status from "http-status";
import { prisma } from "../../lib/prisma";
import { ICreateParticipant, IUpdateParticipant } from "./participant.interface";
import AppError from "../../errorHalpers/AppError";
import { ParticipantStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import { v4 as uuidv4 } from "uuid";

// enum PaymentStatus {  
//   PENDING
//   SUCCESS
//   FAILED
// }



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
    throw new AppError(status.BAD_REQUEST, "Already joined");
  }

  // 🔥 PUBLIC + PAID
  if (event.type === "PUBLIC" && event.isPaid) {
    return await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          userId,
          eventId,
          status: "NEED_PAYMENT",
        },
      });

      const transactionId = uuidv4();

      const payment = await tx.payment.create({
        data: {
          userId,
          eventId,
          participantId: participant.id,
          amount: event.fee,
          transactionId,
          status: PaymentStatus.PENDING,
        },
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: {
                name: event.title,
              },
              unit_amount: event.fee * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentId: payment.id,
          participantId: participant.id,
        },
        success_url: `${envVars.FRONTEND_URL}/payment-success`,
        cancel_url: `${envVars.FRONTEND_URL}/payment-failed`,
      });

      return {
        message: "Payment required",
        paymentUrl: session.url,
      };
    });
  }

  // 🟢 PUBLIC FREE
  let statusValue: any = "PENDING";

  if (event.type === "PUBLIC" && !event.isPaid) {
    statusValue = "APPROVED";
  }

  if (event.type === "PRIVATE") {
    statusValue = "PENDING";
  }

  const participant = await prisma.participant.create({
    data: {
      userId,
      eventId,
      status: statusValue,
    },
  });

  return {
    message: "Joined successfully",
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

// funcrtion for leter payment
const payForEvent = async (participantId: string, userId: string) => {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { event: true },
  });

  if (!participant) {
    throw new AppError(404, "Participant not found");
  }

  if (participant.userId !== userId) {
    throw new AppError(403, "Unauthorized");
  }

  if (participant.status !== "NEED_PAYMENT") {
    throw new AppError(400, "Payment not required");
  }

  return await prisma.$transaction(async (tx) => {
    const transactionId = uuidv4();

    const payment = await tx.payment.create({
      data: {
        userId,
        eventId: participant.eventId,
        participantId: participant.id,
        amount: participant.event.fee,
        transactionId,
        status: PaymentStatus.PENDING,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: participant.event.title,
            },
            unit_amount: participant.event.fee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment.id,
        participantId: participant.id,
      },
      success_url: `${envVars.FRONTEND_URL}/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/payment-failed`,
    });

    return {
      paymentUrl: session.url,
    };
  });
};

export const participantService = {
  joinEvent,
  makeNeedPayment,
  updateMyParticipantApproval,
  getMyParticipant,
  getMyPrivatePaidEvent,
  getParticipantByEventId
}