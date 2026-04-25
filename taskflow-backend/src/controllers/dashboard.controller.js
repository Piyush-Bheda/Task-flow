const pool = require("../config/db");
const { getCache, setCache } = require("../utils/cache");

exports.getSummary = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "workspaceId required" });
    }

    const key = `dashboard:${workspaceId}`;

    // 1) Cache read
    const cached = await getCache(key);
    if (cached) {
      return res.json({ success: true, data: cached, source: "cache" });
    }

    // 2) DB (run in parallel)
    const totalProjectsQ = pool.query(
      "SELECT COUNT(*) FROM projects WHERE workspace_id = $1",
      [workspaceId]
    );

    const totalIssuesQ = pool.query(
      `SELECT COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1`,
      [workspaceId]
    );

    const byStatusQ = pool.query(
      `SELECT status, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY status`,
      [workspaceId]
    );

    const byPriorityQ = pool.query(
      `SELECT priority, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY priority`,
      [workspaceId]
    );

    const [tp, ti, bs, bp] = await Promise.all([
      totalProjectsQ, totalIssuesQ, byStatusQ, byPriorityQ
    ]);

    const data = {
      totalProjects: Number(tp.rows[0].count),
      totalIssues: Number(ti.rows[0].count),
      byStatus: bs.rows,       // [{status, count}]
      byPriority: bp.rows,     // [{priority, count}]
    };

    // 3) Cache write
    await setCache(key, data, 90);

    return res.json({ success: true, data, source: "db" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
};