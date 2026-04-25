const pool = require("../config/db");

// GET ACTIVITY LOGS
exports.getActivityLogs = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    const result = await pool.query(
      `SELECT * FROM activity_logs
       WHERE workspace_id = $1
       ORDER BY created_at DESC`,
      [workspaceId]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};