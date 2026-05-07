import type { NextFunction, Request, Response } from "express";
import pool from "../config/db.js";
import { requireUser, WorkspaceRole, type RoleRow, type TypedRequestHandler } from "../types/app.js";

interface WorkspaceRequestSource {
  workspaceId?: number | string;
}

export function checkRole(allowedRoles: readonly WorkspaceRole[]): TypedRequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUser(req).userId;
      const params = req.params as WorkspaceRequestSource;
      const body = req.body as WorkspaceRequestSource;
      const workspaceId = params.workspaceId ?? body.workspaceId;

      const result = await pool.query<RoleRow>(
        "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
        [workspaceId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Not a member of workspace",
        });
      }

      const userRole = result.rows[0]?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch {
      res.status(500).json({ success: false });
    }
  };
}

export { WorkspaceRole };
