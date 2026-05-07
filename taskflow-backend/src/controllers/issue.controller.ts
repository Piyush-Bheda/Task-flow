import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import pool from "../config/db.js";
import { delCache } from "../utils/cache.js";
import { logActivity } from "../utils/activityLogger.js";
import { requireUser, toNumber, type IssueRecord, type TypedRequestHandler } from "../types/app.js";

interface CreateIssueBody {
  workspaceId?: number | string;
  projectId?: number | string;
  title?: string;
  description?: string | null;
  priority?: string | null;
}

interface UpdateIssueBody {
  workspaceId?: number | string;
  status?: string | null;
  assignee_id?: number | string | null;
}

interface IssueParams extends ParamsDictionary {
  id: string;
}

interface GetIssuesQuery {
  projectId?: string;
  status?: string;
  priority?: string;
  page?: string;
  limit?: string;
}

type IssueQueryValue = string | number | null | undefined;

export const createIssue: TypedRequestHandler<never, unknown, CreateIssueBody> = async (
  req: Request<never, unknown, CreateIssueBody>,
  res: Response,
) => {
  try {
    const { workspaceId, projectId, title, description, priority } = req.body;

    const result = await pool.query<IssueRecord>(
      `INSERT INTO issues (project_id, title, description, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, title, description, priority],
    );

    const createdIssue = result.rows[0];

    if (!createdIssue || workspaceId === undefined) {
      return res.status(201).json({
        success: true,
        data: createdIssue,
      });
    }

    await logActivity({
      workspaceId: toNumber(workspaceId),
      userId: requireUser(req).userId,
      action: "ISSUE_CREATED",
      entityType: "issue",
      entityId: createdIssue.id,
      metadata: { title },
    });

    await delCache(`dashboard:${workspaceId}`);

    res.status(201).json({
      success: true,
      data: createdIssue,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getIssues: TypedRequestHandler<never, unknown, never, GetIssuesQuery> = async (
  req: Request<never, unknown, never, GetIssuesQuery>,
  res: Response,
) => {
  try {
    const { projectId, status, priority } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const offset = (page - 1) * limit;
    let query = "SELECT * FROM issues WHERE project_id = $1";
    const values: IssueQueryValue[] = [projectId];
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

    const result = await pool.query<IssueRecord>(query, values);

    res.json({
      success: true,
      data: result.rows,
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
    const { status, assignee_id } = req.body;

    await delCache(`dashboard:${req.body.workspaceId}`);

    const result = await pool.query<IssueRecord>(
      `UPDATE issues
       SET status = $1,
           assignee_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, assignee_id, id],
    );

    if (req.body.workspaceId !== undefined) {
      await logActivity({
        workspaceId: toNumber(req.body.workspaceId),
        userId: requireUser(req).userId,
        action: "ISSUE_UPDATED",
        entityType: "issue",
        entityId: Number(id),
        metadata: { status, assignee_id },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
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
        userId: requireUser(req).userId,
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
