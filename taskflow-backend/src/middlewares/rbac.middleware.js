const pool = require("../config/db");

exports.checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const workspaceId =
        req.params.workspaceId || req.body.workspaceId;

      const result = await pool.query(
        "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
        [workspaceId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Not a member of workspace",
        });
      }

      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();

    } catch (error) {
      res.status(500).json({ success: false });
    }
  };
};