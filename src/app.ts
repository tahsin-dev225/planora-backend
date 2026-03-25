import express, { Application, Request, Response } from "express";
import { notFound } from "./app/midlewere/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./config/env";
import qs from "qs";
import { IndexRoutes } from "./app/routes";
import { paymentController } from "./app/module/payment/payment.controller";
import { globalErrorHandler } from "./app/midlewere/globalErrorHandler";


const app: Application = express()
app.set("query parser", (str: string) => qs.parse(str))


app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templets`));

app.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhookEvent)

app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/auth", toNodeHandler(auth))

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// cron.schedule("*/25 * * * *", async () => {
//   try {
//     // console.log("Running cron job to cancel unpaid appointments...")
//     await AppointmentService.cancelUnpaidAppointments()
//   } catch (error: any) {
//     console.log("Error occoured while canceling unpaid appoinments : ", error.message)
//   }
// })

app.use('/api/v1', IndexRoutes)

// Basic route
app.get('/', async (req: Request, res: Response) => {

  res.send('Hello, World!');
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;