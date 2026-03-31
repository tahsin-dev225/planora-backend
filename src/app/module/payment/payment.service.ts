import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { ParticipantStatus, PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHalpers/AppError";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  // 🔁 prevent duplicate processing
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Already processed" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const participantId = session.metadata?.participantId;

      if (!paymentId || !participantId) {
        throw new AppError(400, "Missing metadata");
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          participant: true,
        },
      });

      if (!payment) {
        throw new AppError(404, "Payment not found");
      }

      await prisma.$transaction(async (tx) => {
        // 💰 update payment
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.SUCCESS
                : PaymentStatus.FAILED,
            // paymentGatewayData: session as Stripe.Checkout.Session,
            stripeEventId: event.id,
          },
        });

        // 🎉 update participant
        if (session.payment_status === "paid") {
          await tx.participant.update({
            where: { id: participantId },
            data: {
              status: ParticipantStatus.APPROVED,
            },
          });
        }
      });

      console.log(`Payment success & participant approved`);
      break;
    }

    case "payment_intent.payment_failed": {
      console.log(" Payment failed");
      break;
    }

    case "checkout.session.expired": {
      console.log("Session expired");
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return { message: "Webhook processed" };
};

export const PaymentService = {
  handlerStripeWebhookEvent,
};