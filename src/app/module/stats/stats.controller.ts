
import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getDashboardStatsData(req.user);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    sendResponse(res, {
      httpStatusCode: status.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch stats",
    });
  }
}

const getBannerStats = async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getBannerStatsData();
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Banner stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    sendResponse(res, {
      httpStatusCode: status.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch banner stats",
    });
  }
}

export const statsController = {
  getStats,
  getBannerStats
}
