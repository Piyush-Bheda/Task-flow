import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import pool from "../config/db.js";
import { delCache } from "../utils/cache.js";
import { logActivity } from "../utils/activityLogger.js";
import { requireUser, toNumber, type IssueRecord, type TypedRequestHandler, type AuthTokenPayload } from "../types/app.js";

interface CreateIssueBody {
  workspaceId?: number | string;
  projectId?: number | string;
  title?: string;
  description?: string | null;
  priority?: string | null;
  assigneeId?: string | null;
}

interface UpdateIssueBody {
  workspaceId?: number | string;
  status?: string | null;
  assigneeId?: string | null;
  title?: string;
  description?: string;
  priority?: string;
}

interface IssueParams extends ParamsDictionary {
  id: string;
}

interface GetIssuesQuery {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: string;
  limit?: string;
}

interface IssueResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: { id: string; name: string; initials: string } | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeStatus(status: string | null | undefined): string {
  const mapping: Record<string, string> = {
    "open": "Open",
    "todo": "Open",
    "in-progress": "In Progress",
    "done": "Done",
    "closed": "Closed",
  };
  const normalized = (status ?? "open").toLowerCase();
  return mapping[normalized] ?? "Open";
}

function normalizePriority(priority: string | null | undefined): string {
  const mapping: Record<string, string> = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "urgent": "Urgent",
  };
  const normalized = (priority ?? "medium").toLowerCase();
  return mapping[normalized] ?? "Medium";
}

function mapIssue(
  row: IssueRecord & { assignee_name?: string; assignee_initials?: string },
): IssueResponse {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? "",
    status: normalizeStatus(row.status),
    priority: row.priority ?? "medium",
    assignee: row.assignee_id
      ? {
          id: String(row.assignee_id),
          name: row.assignee_name ?? "Unknown",
          initials: row.assignee_initials ?? "?",
        }
      : null,
    projectId: String(row.project_id),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toISOString()
      : new Date().toISOString(),
  };
}

type IssueQueryValue = string | number | null | undefined;

export const createIssue: TypedRequestHandler<never, unknown, CreateIssueBody> = async (
  req: Request<never, unknown, CreateIssueBody>,
  res: Response,
) => {
  try {
    const { workspaceId, projectId, title, description, priority, assigneeId } = req.body;

    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ success: false, message: "Valid project ID is required" });
    }

    // Basic UUID validation to prevent DB crashes on invalid syntax
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid project ID format" });
    }

    // Verify project exists
    const projectCheck = await pool.query("SELECT 1 FROM projects WHERE id = $1", [projectId]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const userCheck = await pool.query("SELECT 1 FROM users WHERE id = $1", [assigneeId]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Assignee not found" });
      }
    }

    const result = await pool.query<IssueRecord>(
      `INSERT INTO issues (project_id, title, description, priority, assignee_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, title, description, normalizePriority(priority), assigneeId || null],
    );

    const createdIssue = result.rows[0];

    if (!createdIssue) {
      return res.status(500).json({ success: false, message: "Failed to create issue" });
    }

    if (workspaceId === undefined) {
      return res.status(201).json({
        success: true,
        data: mapIssue(createdIssue),
      });
    }

    await logActivity({
      workspaceId,
      userId: requireUser(req).userId,
      action: "ISSUE_CREATED",
      entityType: "issue",
      entityId: createdIssue.id,
      metadata: { title },
    });

    await delCache(`dashboard:${workspaceId}`);

    res.status(201).json({
      success: true,
      data: mapIssue(createdIssue),
    });
  } catch (error: any) {
    console.error("[IssueController.createIssue] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

export const getIssue: TypedRequestHandler<IssueParams> = async (
  req: Request<IssueParams>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const result = await pool.query<
      IssueRecord & { assignee_name: string | null; assignee_email: string | null }
    >(
      `SELECT i.*, u.name as assignee_name, u.email as assignee_email
       FROM issues i
       LEFT JOIN users u ON i.assignee_id = u.id
       WHERE i.id = $1`,
      [id],
    );

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    res.json({
      success: true,
      data: mapIssue({
        ...row,
        assignee_name: row.assignee_name ?? "",
        assignee_initials: row.assignee_email
          ? row.assignee_email.charAt(0).toUpperCase()
          : "",
      }),
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch issue" });
  }
};

export const getIssues: TypedRequestHandler<never, unknown, never, GetIssuesQuery> = async (
  req: Request<never, unknown, never, GetIssuesQuery>,
  res: Response,
) => {
  try {
    const { projectId, status, priority, assigneeId, search } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: IssueQueryValue[] = [];
    let index = 1;

    if (projectId) {
      conditions.push(`i.project_id = $${index++}`);
      values.push(projectId);
    }

    if (status) {
      conditions.push(`i.status = $${index++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`i.priority = $${index++}`);
      values.push(priority);
    }

    if (assigneeId) {
      conditions.push(`i.assignee_id = $${index++}`);
      values.push(assigneeId);
    }

    if (search) {
      conditions.push(`(i.title ILIKE $${index++} OR i.description ILIKE $${index})`);
      const pattern = `%${search}%`;
      values.push(pattern, pattern);
      index += 2;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count for pagination
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM issues i ${whereClause}`,
      values.slice(0, index - 1),
    );
    const totalCount = Number(countResult.rows[0]?.count ?? 0);

    // Fetch page data with assignee join
    const dataQuery = `
      SELECT i.*, u.name as assignee_name, u.email as assignee_email
      FROM issues i
      LEFT JOIN users u ON i.assignee_id = u.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${index++} OFFSET $${index}
    `;
    values.push(limit, offset);

    const result = await pool.query<
      IssueRecord & { assignee_name: string | null; assignee_email: string | null }
    >(dataQuery, values);

    const data = result.rows.map((row) =>
      mapIssue({
        ...row,
        assignee_name: row.assignee_name ?? "",
        assignee_initials: row.assignee_email
          ? row.assignee_email.charAt(0).toUpperCase()
          : "",
      }),
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data,
      totalPages,
      totalCount,
      currentPage: page,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const updateIssue: TypedRequestHandler<IssueParams, unknown, UpdateIssueBody> = async (
  req: Request<IssueParams, unknown, UpdateIssueBody>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status, assigneeId, title, description, priority } = req.body;

    await delCache(`dashboard:${req.body.workspaceId}`);

    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let idx = 1;

    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(normalizeStatus(status));
    }
    if (assigneeId !== undefined) {
      fields.push(`assignee_id = $${idx++}`);
      values.push(assigneeId || null);
    }
    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const result = await pool.query<IssueRecord>(
      `UPDATE issues SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      [...values, id],
    );

    const updatedIssue = result.rows[0];

    if (!updatedIssue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    if (req.body.workspaceId !== undefined) {
      await logActivity({
        workspaceId: toNumber(req.body.workspaceId),
        userId: toNumber(requireUser(req).userId),
        action: "ISSUE_UPDATED",
        entityType: "issue",
        entityId: Number(id),
        metadata: { status, assigneeId },
      });
    }

    res.json({
      success: true,
      data: mapIssue(updatedIssue),
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const deleteIssue: TypedRequestHandler<IssueParams, unknown, UpdateIssueBody> = async (
  req: Request<IssueParams, unknown, UpdateIssueBody>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    await delCache(`dashboard:${req.body.workspaceId}`);

    const result = await pool.query<IssueRecord>(
      `DELETE FROM issues
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    const deletedIssue = result.rows[0];

    if (deletedIssue && req.body.workspaceId !== undefined) {
      await logActivity({
        workspaceId: toNumber(req.body.workspaceId),
        userId: toNumber(requireUser(req).userId),
        action: "ISSUE_DELETED",
        entityType: "issue",
        entityId: Number(id),
        metadata: { title: deletedIssue.title },
      });
    }

    res.json({
      success: true,
      data: deletedIssue,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

interface AssignedIssue {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done" | "backlog";
  priority: "low" | "medium" | "high" | "urgent";
  projectName: string;
  dueDate?: string;
}

export const getAssignedIssues: TypedRequestHandler = async (req, res) => {
  try {
    const user = requireUser(req) as AuthTokenPayload;
    const userId = user.userId;

    let result;
    try {
      result = await pool.query<IssueRecord & { project_name: string }>(
        `SELECT i.*, p.name as project_name
         FROM issues i
         JOIN projects p ON i.project_id = p.id
         WHERE i.assignee_id = $1
         ORDER BY i.created_at DESC
         LIMIT 20`,
        [userId],
      );
    } catch (dbError) {
      console.log("getAssignedIssues - No assigned issues or error:", dbError);
      return res.json({ success: true, data: [] });
    }

    const issues: AssignedIssue[] = result.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      status: (row.status ?? "open") as AssignedIssue["status"],
      priority: (row.priority ?? "medium") as AssignedIssue["priority"],
      projectName: row.project_name,
    }));

    res.json({ success: true, data: issues });
  } catch (error) {
    console.error("Error in getAssignedIssues:", error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};
