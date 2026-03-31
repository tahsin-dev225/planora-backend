import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { eventService } from "./event.service";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";



const createEvent = catchAsync(async (req: Request, res: Response) => {
  const { banner, ...eventData } = req.body;

  if (!banner) {
    throw new Error("Banner image is required");
  }

  const uploadBanner = await uploadFileToCloudinary(banner);

  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const payload = {
    ...eventData,
    banner: uploadBanner.secure_url,
  };

  const result = await eventService.createEvent(payload, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    message: "Event created successfully ",
    data: result,
    success: true
  })
})

const getFourUpcomingEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getFourUpcomingEvent();
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Four upcoming events fetched successfully",
    data: result,
    success: true
  })
})

export const getAllEventsController = async (req: Request, res: Response) => {
  const result = await eventService.getAllEvents(req.query);

  res.status(200).json({
    success: true,
    message: "Events fetched successfully",
    meta: result.meta,
    data: result.data,
  });
};

export const getSingleEventController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.getSingleEvent(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Event fetched successfully",
    data: result,
    success: true
  })
})

const getMyEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await eventService.getMyEvents(userId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "My events fetched successfully",
    data: result,
    success: true
  })
})

const updateEventController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const result = await eventService.updateEvent(id as string, req.body, userId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Event updated successfully",
    data: result,
    success: true
  })
})

const deleteEventController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.deleteEvent(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Event deleted successfully",
    data: result,
    success: true
  })
})

const updateAdminEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.updateAdminEvent(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Event updated successfully",
    data: result,
    success: true
  })
})

const makeFeaturedController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await eventService.makeFeatured(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Event featured successfully",
    data: result,
    success: true
  })
})

const getFeaturedEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getFeaturedEvents();
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Featured events fetched successfully",
    data: result,
    success: true
  })
})

const getAllEventsForFeature = catchAsync(async (req: Request, res: Response) => {
  const result = await eventService.getAllEventsOnlyPagination(req.query.page as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Events fetched successfully",
    data: result,
    success: true
  })
})

export const eventController = {
  createEvent,
  getAllEventsController,
  getMyEvents,
  getSingleEventController,
  updateEventController,
  deleteEventController,
  updateAdminEvent,
  getFourUpcomingEvent,
  makeFeaturedController,
  getFeaturedEvents,
  getAllEventsForFeature
}
