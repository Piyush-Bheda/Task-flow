import type { Request, Response } from "express";
import pool from "../config/db.js";
import type { ActivityLogRecord, TypedRequestHandler, AuthTokenPayload } from "../types/app.js";
import { requireUser } from "../types/app.js";

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

interface RecentActivity {
  id: string;
  type: "issue_updated" | "project_created" | "comment_added" | "issue_completed";
  title: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
}

export const getRecentActivity: TypedRequestHandler = async (req, res) => {
  try {
    const user = requireUser(req) as AuthTokenPayload;
    const userId = user.userId;

    let workspaceResult;
    try {
      workspaceResult = await pool.query<{ workspace_id: string }>(
        "SELECT workspace_id FROM workspace_members WHERE user_id = $1 LIMIT 1",
        [userId],
      );
    } catch (dbError) {
      console.log("getRecentActivity - No workspace found");
      return res.json({ success: true, data: [] });
    }

    if (workspaceResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const workspaceId = workspaceResult.rows[0]!.workspace_id;

    const result = await pool.query<ActivityLogRecord>(
      `SELECT al.*, u.name as user_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.workspace_id = $1
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [workspaceId],
    );

    const activities: RecentActivity[] = result.rows.map((row) => ({
      id: String(row.id),
      type: row.action as RecentActivity["type"],
      title: `${row.action.replace(/_/g, " ")}: ${row.entity_type}`,
      user: {
        name: row.user_id ? `User ${row.user_id}` : "System",
        initials: row.user_id ? `U${row.user_id}` : "SY",
      },
      timestamp: row.created_at?.toISOString() ?? new Date().toISOString(),
    }));

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error in getRecentActivity:", error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};
