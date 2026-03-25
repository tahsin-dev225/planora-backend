import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import status from "http-status";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;


    if (!signature || !webhookSecret) {
      console.log("Missing stripe signature or webhook secret");
      return res.status(status.BAD_REQUEST).json({
        message: "Missing stripe signature or webhook secret"
      })
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (error) {
      console.log("Error procesing stripe webhook", error);
      return res.status(status.BAD_REQUEST).json({ message: "Error procesing stripe webhook" })
    }

    try {
      const result = await PaymentService.handlerStripeWebhookEvent(event);

      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stripe webhook event prossed successfully.",
        data: result
      })
    } catch (error) {
      console.log("error handing stripe webhook envet : ", error);
      sendResponse(res, {
        httpStatusCode: status.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error handling stripe webhook event",

      })
    }

  }
)

export const paymentController = {
  handleStripeWebhookEvent
}