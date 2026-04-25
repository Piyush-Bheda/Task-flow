const pool = require("../config/db");
const { logActivity } = require("../utils/activityLogger");
const { delCache } = require("../utils/cache");

// CREATE ISSUE
exports.createIssue = async (req, res) => {
  try {
    // send also workspaceId in body
    const { workspaceId, projectId, title, description, priority } = req.body;

    const result = await pool.query(
      `INSERT INTO issues (project_id, title, description, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, title, description, priority]
    );

    // log activity
    await logActivity({
      workspaceId: req.body.workspaceId,
      userId: req.user.userId,
      action: "ISSUE_CREATED",
      entityType: "issue",
      entityId: result.rows[0].id,
      metadata: { title },
    });

    // invalidate dashboard cache
    await delCache(`dashboard:${workspaceId}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


// GET ISSUES (with filtering + pagination)
exports.getIssues = async (req, res) => {
  try {
    const { projectId, status, priority, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    let query = "SELECT * FROM issues WHERE project_id = $1";
    let values = [projectId];
    let index = 2;

    if (status) {
      query += ` AND status = $${index++}`;
      values.push(status);
    }

    if (priority) {
      query += ` AND priority = $${index++}`;
      values.push(priority);
    }

    query += ` LIMIT $${index++} OFFSET $${index}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


// UPDATE ISSUE
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignee_id } = req.body;

    // invalidate dashboard cache
    await delCache(`dashboard:${req.body.workspaceId}`);

    const result = await pool.query(
      `UPDATE issues
       SET status = $1,
           assignee_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, assignee_id, id]
    );

    // log activity
    await logActivity({
      workspaceId: req.body.workspaceId,
      userId: req.user.userId,
      action: "ISSUE_UPDATED",
      entityType: "issue",
      entityId: id,
      metadata: { status, assignee_id },
    });

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // invalidate dashboard cache
    await delCache(`dashboard:${req.body.workspaceId}`);

    const result = await pool.query(
      `DELETE FROM issues
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // log activity
    await logActivity({
      workspaceId: req.body.workspaceId,
      userId: req.user.userId,
      action: "ISSUE_DELETED",
      entityType: "issue",
      entityId: id,
      metadata: { title: result.rows[0].title },
    });

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};