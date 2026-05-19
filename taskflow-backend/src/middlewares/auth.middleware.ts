import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { type AuthTokenPayload, type TypedRequestHandler } from "../types/app.js";

export const authMiddleware: TypedRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Malformed token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, secret) as { userId: number | string };
    console.log("Decoded:", decoded);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload - missing userId",
      });
    }

    // Keep the userId as-is (could be UUID or integer)
    req.user = { userId: decoded.userId as string };
    console.log("User set:", req.user);
    next();
  } catch (error: any) {
    console.error("Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
