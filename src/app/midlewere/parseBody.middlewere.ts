// parseBody.middleware.ts

import { Request, Response, NextFunction } from "express";

export const parseBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in 'data'",
      });
    }
  }
  next();
};