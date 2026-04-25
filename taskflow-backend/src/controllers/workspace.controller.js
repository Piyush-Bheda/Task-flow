const pool = require("../config/db");

// CREATE WORKSPACE
exports.createWorkspace = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Workspace name required",
            });
        }

        // create workspace
        const workspace = await pool.query(
            "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *",
            [name, userId]
        );

        // add owner as member
        await pool.query(
            "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
            [workspace.rows[0].id, userId, "owner"]
        );

        res.status(201).json({
            success: true,
            data: workspace.rows[0],
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
};


// GET USER WORKSPACES
exports.getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT w.*
       FROM workspaces w
       JOIN workspace_members wm
       ON w.id = wm.workspace_id
       WHERE wm.user_id = $1`,
            [userId]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "No workspaces found",
            });
        }

        res.json({
            success: true,
            data: result.rows,
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};


// ADD MEMBER
exports.addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const workspaceId = req.params.id;

        await pool.query(
            "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
            [workspaceId, userId, role || "member"]
        );

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to add member",
        });
    }
};