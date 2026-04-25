const pool = require("../config/db");
const { delCache } = require("../utils/cache");

// CREATE PROJECT
exports.createProject = async (req, res) => {
    try {
        const { name, description, workspaceId } = req.body;

        const result = await pool.query(
            "INSERT INTO projects (workspace_id, name, description) VALUES ($1, $2, $3) RETURNING *",
            [workspaceId, name, description]
        );

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

// GET PROJECTS
exports.getProjects = async (req, res) => {
    try {
        const { workspaceId } = req.query;


        const result = await pool.query(
            "SELECT * FROM projects WHERE workspace_id = $1",
            [workspaceId]
        );

        res.json({
            success: true,
            data: result.rows,
        });

    } catch (error) {
        console.error("getProjects error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // invalidate dashboard cache
        await delCache(`dashboard:${req.body.workspaceId}`);

        const result = await pool.query(
            "UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
            [name, description, id]
        );

        res.json({
            success: true,
            data: result.rows[0],
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // invalidate dashboard cache
        await delCache(`dashboard:${req.body.workspaceId}`);

        const result = await pool.query(
            "DELETE FROM projects WHERE id = $1 RETURNING *",
            [id]
        );

        res.json({
            success: true,
            data: result.rows[0],
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};