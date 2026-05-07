import pool from "../config/db.js";
import type { ActivityLogRecord } from "../types/app.js";

export interface LogActivityInput {
  workspaceId: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  workspaceId,
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}: LogActivityInput): Promise<void> {
  try {
    await pool.query<ActivityLogRecord>(
      `INSERT INTO activity_logs 
       (workspace_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [workspaceId, userId, action, entityType, entityId, metadata],
    );
  } catch (error) {
    console.error("Activity log failed", error);
  }
}
