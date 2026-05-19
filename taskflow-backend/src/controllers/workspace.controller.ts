import type { Request, Response } from "express";
import pool from "../config/db.js";
import {
  WorkspaceRole,
  requireUser,
  type TypedRequestHandler,
  type WorkspaceRecord,
} from "../types/app.js";

interface CreateWorkspaceBody {
  name?: string;
}

interface AddMemberParams {
  id?: string;
}

interface AddMemberBody {
  userId?: number | string;
  role?: WorkspaceRole;
}

export const createWorkspace: TypedRequestHandler<never, unknown, CreateWorkspaceBody> = async (
  req: Request<never, unknown, CreateWorkspaceBody>,
  res: Response,
) => {
  try {
    const { name } = req.body;
    const userId = requireUser(req).userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Workspace name required",
      });
    }

    const workspace = await pool.query<WorkspaceRecord>(
      "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, userId],
    );

    const createdWorkspace = workspace.rows[0];

    if (!createdWorkspace) {
      return res.status(500).json({ success: false });
    }

    await pool.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
      [createdWorkspace.id, userId, WorkspaceRole.Owner],
    );

    res.status(201).json({
      success: true,
      data: {
        id: String(createdWorkspace.id),
        name: createdWorkspace.name,
        owner_id: String(createdWorkspace.owner_id),
        created_at: createdWorkspace.created_at,
        updated_at: createdWorkspace.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getUserWorkspaces: TypedRequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req).userId;

    const result = await pool.query<WorkspaceRecord>(
      `SELECT w.*
       FROM workspaces w
       JOIN workspace_members wm
       ON w.id = wm.workspace_id
       WHERE wm.user_id = $1`,
      [userId],
    );

    const workspaces = result.rows.map(w => ({
      id: String(w.id),
      name: w.name,
      owner_id: String(w.owner_id),
      created_at: w.created_at,
      updated_at: w.updated_at,
    }));

    res.json({
      success: true,
      data: workspaces,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const addMember: TypedRequestHandler<AddMemberParams, unknown, AddMemberBody> = async (
  req: Request<AddMemberParams, unknown, AddMemberBody>,
  res: Response,
) => {
  try {
    const { userId, role } = req.body;
    const workspaceId = req.params.id;

    await pool.query(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
      [workspaceId, userId, role ?? WorkspaceRole.Member],
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
