import type { Request, Response } from "express";
import pool from "../config/db.js";
import type { ActivityLogRecord, TypedRequestHandler } from "../types/app.js";

interface GetActivityLogsQuery {
  workspaceId?: string;
}

export const getActivityLogs: TypedRequestHandler<never, unknown, never, GetActivityLogsQuery> =
  async (req: Request<never, unknown, never, GetActivityLogsQuery>, res: Response) => {
    try {
      const { workspaceId } = req.query;

      const result = await pool.query<ActivityLogRecord>(
        `SELECT * FROM activity_logs
         WHERE workspace_id = $1
         ORDER BY created_at DESC`,
        [workspaceId],
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch {
      res.status(500).json({ success: false });
    }
  };
