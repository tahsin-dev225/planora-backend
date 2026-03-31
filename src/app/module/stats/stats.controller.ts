
import { Request, Response } from "express";
import { statsService } from "./stats.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";

const getStats = catchAsync(async (req: Request, res: Response) => {

  const stats = await statsService.getDashboardStatsData(req.user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stats fetched successfully",
    data: stats,
  });

})

const getBannerStats = catchAsync(async (req: Request, res: Response) => {

  const stats = await statsService.getBannerStatsData();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Banner stats fetched successfully",
    data: stats,
  });
})



export const statsController = {
  getStats,
  getBannerStats
}
