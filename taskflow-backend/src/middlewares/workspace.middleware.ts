import type { NextFunction, Request, Response } from "express";
import pool from "../config/db.js";
import { requireUser, type TypedRequestHandler, type WorkspaceMemberRecord } from "../types/app.js";

interface WorkspaceRequestSource {
  workspaceId?: number | string;
}

export const checkWorkspaceAccess: TypedRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUser(req).userId;
    const params = req.params as WorkspaceRequestSource;
    const body = req.body as WorkspaceRequestSource;
    const workspaceId = params.workspaceId ?? body.workspaceId;

    const result = await pool.query<WorkspaceMemberRecord>(
      "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  } catch {
    res.status(500).json({ success: false });
  }
};
