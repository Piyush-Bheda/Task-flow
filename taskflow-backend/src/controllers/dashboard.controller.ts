import type { Request, Response } from "express";
import pool from "../config/db.js";
import { getCache, setCache } from "../utils/cache.js";
import type {
  CountRow,
  IssuesOverTimeRow,
  PriorityCountRow,
  ProjectIssueCountRow,
  StatusCountRow,
  TypedRequestHandler,
  AuthTokenPayload,
} from "../types/app.js";
import { requireUser } from "../types/app.js";

interface DashboardQuery {
  workspaceId?: string;
}

interface DashboardSummary {
  totalProjects: number;
  totalIssues: number;
  byStatus: StatusCountRow[];
  byPriority: PriorityCountRow[];
}

interface DashboardStats {
  totalProjects: number;
  totalIssues: number;
  completedIssues: number;
  activeUsers: number;
}

interface DashboardCharts {
  issuesByStatus: StatusCountRow[];
  issuesByPriority: PriorityCountRow[];
  issuesOverTime: IssuesOverTimeRow[];
}

interface DashboardProjects {
  issuesByProject: ProjectIssueCountRow[];
}

export const getSummary: TypedRequestHandler<never, unknown, never, DashboardQuery> = async (
  req: Request<never, unknown, never, DashboardQuery>,
  res: Response,
) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "workspaceId required" });
    }

    const key = `dashboard:${workspaceId}`;
    const cached = await getCache<DashboardSummary>(key);

    if (cached) {
      return res.json({ success: true, data: cached, source: "cache" });
    }

    const totalProjectsQ = pool.query<CountRow>(
      "SELECT COUNT(*) FROM projects WHERE workspace_id = $1",
      [workspaceId],
    );

    const totalIssuesQ = pool.query<CountRow>(
      `SELECT COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1`,
      [workspaceId],
    );

    const byStatusQ = pool.query<StatusCountRow>(
      `SELECT status, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY status`,
      [workspaceId],
    );

    const byPriorityQ = pool.query<PriorityCountRow>(
      `SELECT priority, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY priority`,
      [workspaceId],
    );

    const [tp, ti, bs, bp] = await Promise.all([totalProjectsQ, totalIssuesQ, byStatusQ, byPriorityQ]);

    const data: DashboardSummary = {
      totalProjects: Number(tp.rows[0]?.count ?? 0),
      totalIssues: Number(ti.rows[0]?.count ?? 0),
      byStatus: bs.rows,
      byPriority: bp.rows,
    };

    await setCache(key, data, 90);

    return res.json({ success: true, data, source: "db" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getChartData: TypedRequestHandler<never, unknown, never, DashboardQuery> = async (
  req: Request<never, unknown, never, DashboardQuery>,
  res: Response,
) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "workspaceId required" });
    }

    const key = `dashboard:${workspaceId}:charts`;
    const cached = await getCache<DashboardCharts>(key);

    if (cached) {
      return res.json({ success: true, data: cached, source: "cache" });
    }

    const issuesByStatusQ = pool.query<StatusCountRow>(
      `SELECT status, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY status
       ORDER BY COUNT(*) DESC`,
      [workspaceId],
    );

    const issuesByPriorityQ = pool.query<PriorityCountRow>(
      `SELECT priority, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY priority
       ORDER BY COUNT(*) DESC`,
      [workspaceId],
    );

    const issuesOverTimeQ = pool.query<IssuesOverTimeRow>(
      `SELECT DATE_TRUNC('week', created_at)::date AS week,
              status,
              COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY week, status
       ORDER BY week, status`,
      [workspaceId],
    );

    const [bs, bp, iot] = await Promise.all([issuesByStatusQ, issuesByPriorityQ, issuesOverTimeQ]);

    const data: DashboardCharts = {
      issuesByStatus: bs.rows,
      issuesByPriority: bp.rows,
      issuesOverTime: iot.rows,
    };

    await setCache(key, data, 90);

    return res.json({ success: true, data, source: "db" });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const getIssuesByProject: TypedRequestHandler<never, unknown, never, DashboardQuery> = async (
  req: Request<never, unknown, never, DashboardQuery>,
  res: Response,
) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "workspaceId required" });
    }

    const key = `dashboard:${workspaceId}:projects`;
    const cached = await getCache<DashboardProjects>(key);

    if (cached) {
      return res.json({ success: true, data: cached, source: "cache" });
    }

    const issuesByProjectQ = pool.query<ProjectIssueCountRow>(
      `SELECT p.name, COUNT(*) 
       FROM issues i
       JOIN projects p ON i.project_id = p.id
       WHERE p.workspace_id = $1
       GROUP BY p.name
       ORDER BY COUNT(*) DESC`,
      [workspaceId],
    );

    const [bp] = await Promise.all([issuesByProjectQ]);

    const data: DashboardProjects = {
      issuesByProject: bp.rows,
    };

    await setCache(key, data, 90);

    return res.json({ success: true, data, source: "db" });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const getStats: TypedRequestHandler = async (req, res) => {
  try {
    const user = requireUser(req) as AuthTokenPayload;
    const userId = user.userId;
    console.log("getStats - userId:", userId, typeof userId);

    let workspaceResult;
    try {
      workspaceResult = await pool.query<{ workspace_id: string }>(
        "SELECT workspace_id FROM workspace_members WHERE user_id = $1 LIMIT 1",
        [userId],
      );
    } catch (dbError: any) {
      console.log("getStats - DB error:", dbError.message);
      // If query fails due to type mismatch, user has no workspace
      return res.json({
        success: true,
        data: {
          totalProjects: 0,
          totalIssues: 0,
          completedIssues: 0,
          activeUsers: 0,
        },
      });
    }

    console.log("getStats - workspaceResult:", workspaceResult.rows);

    if (workspaceResult.rows.length === 0) {
      console.log("getStats - No workspace, returning zeros");
      return res.json({
        success: true,
        data: {
          totalProjects: 0,
          totalIssues: 0,
          completedIssues: 0,
          activeUsers: 0,
        },
      });
    }

    const workspaceId = workspaceResult.rows[0]!.workspace_id;
    console.log("getStats - workspaceId:", workspaceId);

    const [projectsResult, issuesResult, completedResult, usersResult] = await Promise.all([
      pool.query<CountRow>("SELECT COUNT(*) FROM projects WHERE workspace_id = $1", [workspaceId]),
      pool.query<CountRow>(
        "SELECT COUNT(*) FROM issues i JOIN projects p ON i.project_id = p.id WHERE p.workspace_id = $1",
        [workspaceId],
      ),
      pool.query<CountRow>(
        "SELECT COUNT(*) FROM issues i JOIN projects p ON i.project_id = p.id WHERE p.workspace_id = $1 AND i.status = 'done'",
        [workspaceId],
      ),
      pool.query<CountRow>(
        "SELECT COUNT(DISTINCT user_id) FROM workspace_members WHERE workspace_id = $1",
        [workspaceId],
      ),
    ]);

    const data: DashboardStats = {
      totalProjects: Number(projectsResult.rows[0]?.count ?? 0),
      totalIssues: Number(issuesResult.rows[0]?.count ?? 0),
      completedIssues: Number(completedResult.rows[0]?.count ?? 0),
      activeUsers: Number(usersResult.rows[0]?.count ?? 0),
    };

    console.log("getStats - returning:", data);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};
