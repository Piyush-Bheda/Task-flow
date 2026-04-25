const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { issueId, content, workspaceId } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO comments (issue_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [issueId, userId, content]
    );

    // log activity
    await logActivity({
      workspaceId,
      userId,
      action: "COMMENT_ADDED",
      entityType: "issue",
      entityId: issueId,
      metadata: { content },
    });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


// GET COMMENTS
exports.getComments = async (req, res) => {
  try {
    const { issueId } = req.query;

    const result = await pool.query(
      "SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC",
      [issueId]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};