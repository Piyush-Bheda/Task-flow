import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import pool from "../config/db.js";
import { delCache } from "../utils/cache.js";
import { getErrorMessage, type ProjectRecord, type TypedRequestHandler, type AuthTokenPayload, type ProjectRole, type IssueRecord } from "../types/app.js";
import { requireUser } from "../types/app.js";

interface CreateProjectBody {
  name?: string;
  description?: string | null;
  workspaceId?: number | string;
}

interface UpdateProjectParams extends ParamsDictionary {
  id: string;
}

interface GetProjectsQuery {
  workspaceId?: string;
}

interface IssuePriorityRow {
  priority: string | null;
  count: string;
}

interface IssueStatusRow {
  status: string | null;
  count: string;
}

export const createProject: TypedRequestHandler<never, unknown, CreateProjectBody> = async (
  req: Request<never, unknown, CreateProjectBody>,
  res: Response,
) => {
  try {
    const { name, description, workspaceId } = req.body;
    const user = requireUser(req) as AuthTokenPayload;

    // Validate inputs
    if (!workspaceId || typeof workspaceId !== "string" || workspaceId.trim() === "") {
      return res.status(400).json({ success: false, message: "Workspace is required" });
    }

    const trimmedName = (name ?? "").trim();
    if (!trimmedName) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    // Verify the user is a member of the workspace
    const workspaceMember = await pool.query<{ role: string }>(
      "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    if (workspaceMember.rows.length === 0) {
      return res.status(403).json({ success: false, message: "You don't have access to this workspace" });
    }

    // Verify workspace exists
    const workspaceExists = await pool.query(
      "SELECT 1 FROM workspaces WHERE id = $1",
      [workspaceId],
    );
    if (workspaceExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const result = await pool.query<ProjectRecord>(
      "INSERT INTO projects (workspace_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [workspaceId, trimmedName, description ?? null],
    );

    const created = result.rows[0];
    if (!created) {
      return res.status(500).json({ success: false, message: "Failed to create project" });
    }

    // Add creator as owner in project_members
    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)",
      [created.id, user.userId, "owner" as ProjectRole],
    );

    // Auto-add all workspace owners and admins as project members
    // (since they have full workspace privileges, they should also have project access)
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       SELECT $1, wm.user_id, 'admin'::text
       FROM workspace_members wm
       WHERE wm.workspace_id = $2
         AND wm.user_id != $3
         AND wm.role IN ('owner', 'admin')
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [created.id, workspaceId, user.userId],
    );

    await delCache(`dashboard:${workspaceId}`);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error("createProject error:", getErrorMessage(error));
    // Provide a helpful message if a required table is missing
    const msg = getErrorMessage(error) || "Failed to create project";
    if (msg.includes("does not exist") && msg.includes("relation")) {
      return res.status(500).json({
        success: false,
        message: "Database is missing a required table. Please run migrations: `npm run migrate` (or restart the server, which auto-runs them).",
      });
    }
    res.status(500).json({ success: false, message: msg });
  }
};

export const getProjects: TypedRequestHandler<never, unknown, never, GetProjectsQuery> = async (
  req: Request<never, unknown, never, GetProjectsQuery>,
  res: Response,
) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string" || workspaceId.trim() === "") {
      return res.status(400).json({ success: false, message: "workspaceId is required" });
    }

    const result = await pool.query<ProjectRecord>(
      "SELECT * FROM projects WHERE workspace_id = $1",
      [workspaceId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("getProjects error:", getErrorMessage(error));
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

interface ProjectParams extends ParamsDictionary {
  id: string;
}

export const getProject: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { id } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    const result = await pool.query<ProjectRecord>(
      "SELECT * FROM projects WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = result.rows[0]!;

    // Verify the user is a member of the project's workspace
    const workspaceId = project.workspace_id;
    const workspaceMember = await pool.query(
      "SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    if (workspaceMember.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("getProject error:", getErrorMessage(error));
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

async function checkProjectManageAccess(
  projectId: string,
  userId: string | number,
): Promise<{ allowed: boolean; status?: number; message?: string }> {
  const projectRow = await pool.query<{ workspace_id: string }>(
    "SELECT workspace_id FROM projects WHERE id = $1",
    [projectId],
  );

  if (projectRow.rows.length === 0) {
    return { allowed: false, status: 404, message: "Project not found" };
  }

  const workspaceId = projectRow.rows[0]!.workspace_id;

  // Check workspace membership first
  const wsMember = await pool.query<{ role: string }>(
    "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
    [workspaceId, userId],
  );

  if (wsMember.rows.length === 0) {
    return { allowed: false, status: 403, message: "Access denied" };
  }

  const wsRole = wsMember.rows[0]!.role;
  // Workspace owner/admin can manage any project in the workspace
  if (wsRole === "owner" || wsRole === "admin") {
    return { allowed: true };
  }

  // For workspace members, check project-level role
  const pjMember = await pool.query<{ role: string }>(
    "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId],
  );

  const pjRole = pjMember.rows[0]?.role;
  if (pjRole === "owner" || pjRole === "admin") {
    return { allowed: true };
  }

  return { allowed: false, status: 403, message: "Only project admin or owner can perform this action" };
}

export const updateProject: TypedRequestHandler<UpdateProjectParams, unknown, CreateProjectBody> =
  async (req: Request<UpdateProjectParams, unknown, CreateProjectBody>, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const user = requireUser(req) as AuthTokenPayload;

      const access = await checkProjectManageAccess(id, user.userId);
      if (!access.allowed) {
        return res.status(access.status ?? 403).json({ success: false, message: access.message ?? "Access denied" });
      }

      const trimmedName = (name ?? "").trim();
      if (!trimmedName) {
        return res.status(400).json({ success: false, message: "Project name is required" });
      }

      const result = await pool.query<ProjectRecord>(
        "UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [trimmedName, description ?? null, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("updateProject error:", getErrorMessage(error));
      res.status(500).json({ success: false, message: getErrorMessage(error) || "Failed to update project" });
    }
  };

export const deleteProject: TypedRequestHandler<UpdateProjectParams> =
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = requireUser(req) as AuthTokenPayload;

      // Only project owner or workspace owner/admin can delete
      const projectRow = await pool.query<{ workspace_id: string }>(
        "SELECT workspace_id FROM projects WHERE id = $1",
        [id],
      );

      if (projectRow.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      const workspaceId = projectRow.rows[0]!.workspace_id;

      // Check workspace ownership
      const wsMember = await pool.query<{ role: string }>(
        "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
        [workspaceId, user.userId],
      );

      const wsRole = wsMember.rows[0]?.role;
      const isWorkspaceOwnerAdmin = wsRole === "owner" || wsRole === "admin";

      // Check project ownership
      const pjMember = await pool.query<{ role: string }>(
        "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
        [id, user.userId],
      );

      const pjRole = pjMember.rows[0]?.role;
      const isProjectOwner = pjRole === "owner";

      if (!isProjectOwner && !isWorkspaceOwnerAdmin) {
        return res.status(403).json({ success: false, message: "Only project owner can delete this project" });
      }

      await pool.query("DELETE FROM project_members WHERE project_id = $1", [id]);
      await pool.query("DELETE FROM issues WHERE project_id = $1", [id]);
      const result = await pool.query<ProjectRecord>("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);

      await delCache(`dashboard:${workspaceId}`);

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("deleteProject error:", getErrorMessage(error));
      res.status(500).json({ success: false, message: getErrorMessage(error) || "Failed to delete project" });
    }
  };

export const getProjectStats: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { id } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    // Check if user is at least a member of the project's workspace
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [id],
    );

    if (projectRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const workspaceId = projectRow.rows[0]!.workspace_id;

    const workspaceMemberCheck = await pool.query(
      "SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get issue counts by status
    const [totalResult, openResult, inProgressResult, doneResult] = await Promise.all([
      pool.query<{ count: string }>("SELECT COUNT(*) as count FROM issues WHERE project_id = $1", [id]),
      pool.query<{ count: string }>("SELECT COUNT(*) as count FROM issues WHERE project_id = $1 AND status = 'open'", [id]),
      pool.query<{ count: string }>("SELECT COUNT(*) as count FROM issues WHERE project_id = $1 AND status = 'in_progress'", [id]),
      pool.query<{ count: string }>("SELECT COUNT(*) as count FROM issues WHERE project_id = $1 AND status = 'done'", [id]),
    ]);

    // Get members count
    const membersResult = await pool.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM project_members WHERE project_id = $1",
      [id]
    );

    const stats = {
      totalIssues: parseInt(totalResult.rows[0]?.count || "0", 10),
      openIssues: parseInt(openResult.rows[0]?.count || "0", 10),
      inProgressIssues: parseInt(inProgressResult.rows[0]?.count || "0", 10),
      completedIssues: parseInt(doneResult.rows[0]?.count || "0", 10),
      membersCount: parseInt(membersResult.rows[0]?.count || "0", 10),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("getProjectStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project stats" });
  }
};

export const getProjectIssues: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { id } = req.params;
    const user = requireUser(req) as AuthTokenPayload;
    const { status, priority, search, page = "1", limit = "20" } = req.query as Record<string, string>;

    // Check if user is at least a member of the project's workspace
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [id],
    );

    if (projectRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const workspaceId = projectRow.rows[0]!.workspace_id;

    const workspaceMemberCheck = await pool.query(
      "SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let query = "SELECT i.*, u.name as assignee_name, u.email as assignee_email FROM issues i LEFT JOIN users u ON i.assignee_id = u.id WHERE i.project_id = $1";
    const values: (string | number)[] = [id];
    let paramIndex = 2;

    if (status) {
      query += ` AND i.status = $${paramIndex++}`;
      values.push(status);
    }

    if (priority) {
      query += ` AND i.priority = $${paramIndex++}`;
      values.push(priority);
    }

    if (search) {
      query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace("SELECT i.*, u.name as assignee_name, u.email as assignee_email", "SELECT COUNT(*) as count");
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.count || "0", 10);

    // Add pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    values.push(parseInt(limit, 10), offset);

    const result = await pool.query(query, values);

    const issues = result.rows.map((row) => ({
      id: String(row.id),
      projectId: String(row.project_id),
      title: row.title,
      description: row.description,
      priority: row.priority || "medium",
      status: row.status || "open",
      assigneeId: row.assignee_id ? String(row.assignee_id) : null,
      assignee: row.assignee_id ? { id: String(row.assignee_id), name: row.assignee_name, email: row.assignee_email } : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: { issues, total },
    });
  } catch (error) {
    console.error("getProjectIssues error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch issues" });
  }
};

export const getProjectActivity: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { id } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    // Check if user is at least a member of the project's workspace
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [id],
    );

    if (projectRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const workspaceId = projectRow.rows[0]!.workspace_id;

    const workspaceMemberCheck = await pool.query(
      "SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    if (workspaceMemberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get activity logs for this project
    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [id]
    );

    const activities = result.rows.map((row) => ({
      id: String(row.id),
      type: row.action,
      title: `${row.action.replace(/_/g, " ")}: ${row.entity_type}`,
      user: {
        id: String(row.user_id),
        name: row.user_name || "System",
        initials: row.user_name ? row.user_name.charAt(0).toUpperCase() : "S",
      },
      timestamp: row.created_at,
      metadata: row.metadata,
    }));

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("getProjectActivity error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activity" });
  }
};