import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getErrorMessage, type AuthTokenPayload, type TypedRequestHandler } from "../types/app.js";

function isAuthTokenPayload(value: string | JwtPayload): value is AuthTokenPayload {
  return typeof value === "object" && value !== null && typeof value.userId === "number";
}

export const authMiddleware: TypedRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    if (!actualToken) {
      return res.status(401).json({ message: "Malformed token" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    if (!isAuthTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
