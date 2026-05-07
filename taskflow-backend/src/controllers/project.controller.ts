import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import pool from "../config/db.js";
import { delCache } from "../utils/cache.js";
import { getErrorMessage, type ProjectRecord, type TypedRequestHandler } from "../types/app.js";

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

export const createProject: TypedRequestHandler<never, unknown, CreateProjectBody> = async (
  req: Request<never, unknown, CreateProjectBody>,
  res: Response,
) => {
  try {
    const { name, description, workspaceId } = req.body;

    const result = await pool.query<ProjectRecord>(
      "INSERT INTO projects (workspace_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [workspaceId, name, description],
    );

    await delCache(`dashboard:${workspaceId}`);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getProjects: TypedRequestHandler<never, unknown, never, GetProjectsQuery> = async (
  req: Request<never, unknown, never, GetProjectsQuery>,
  res: Response,
) => {
  try {
    const { workspaceId } = req.query;

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

export const updateProject: TypedRequestHandler<UpdateProjectParams, unknown, CreateProjectBody> =
  async (req: Request<UpdateProjectParams, unknown, CreateProjectBody>, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      await delCache(`dashboard:${req.body.workspaceId}`);

      const result = await pool.query<ProjectRecord>(
        "UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [name, description, id],
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch {
      res.status(500).json({ success: false });
    }
  };

export const deleteProject: TypedRequestHandler<UpdateProjectParams, unknown, CreateProjectBody> =
  async (req: Request<UpdateProjectParams, unknown, CreateProjectBody>, res: Response) => {
    try {
      const { id } = req.params;

      await delCache(`dashboard:${req.body.workspaceId}`);

      const result = await pool.query<ProjectRecord>("DELETE FROM projects WHERE id = $1 RETURNING *", [
        id,
      ]);

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch {
      res.status(500).json({ success: false });
    }
  };
