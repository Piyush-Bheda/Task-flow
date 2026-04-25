const pool = require("../config/db");

exports.logActivity = async ({
  workspaceId,
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs 
       (workspace_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [workspaceId, userId, action, entityType, entityId, metadata]
    );
  } catch (error) {
    console.error("Activity log failed", error);
  }
};