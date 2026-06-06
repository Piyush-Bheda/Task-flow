import type { Request, Response } from "express";
import pool from "../config/db.js";
import {
  ProjectRole,
  requireUser,
  type TypedRequestHandler,
  type ProjectMemberRecord,
  type AuthTokenPayload,
} from "../types/app.js";


import type { ParamsDictionary } from "express-serve-static-core";

interface ProjectParams extends ParamsDictionary {
  projectId: string;
}

interface MemberParams extends ProjectParams {
  userId: string;
}

interface AddMemberBody {
  userId?: number | string;
  email?: string;
  role?: ProjectRole;
}

export const getProjectMembers: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    // Verify user is at least a member of the project's workspace
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [projectId],
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

    const result = await pool.query<ProjectMemberRecord & { name: string; email: string }>(
      `SELECT pm.*, u.name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY 
         CASE pm.role 
           WHEN 'owner' THEN 1 
           WHEN 'admin' THEN 2 
           WHEN 'member' THEN 3 
         END,
         u.name`,
      [projectId]
    );

    const members = result.rows.map((row) => ({
      projectId: row.project_id,
      userId: row.user_id,
      role: row.role,
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
      },
    }));

    res.json({ success: true, data: members });
  } catch (error) {
    console.error("getProjectMembers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project members" });
  }
};

export const getProjectMemberRole: TypedRequestHandler<ProjectParams> = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    const result = await pool.query<ProjectMemberRecord>(
      "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, user.userId]
    );

    const member = result.rows[0];
    if (!member) {
      // Not a direct project member; check if they're a workspace owner/admin
      // (they may have implicit access via workspace role)
      const projectRow = await pool.query<{ workspace_id: string }>(
        "SELECT workspace_id FROM projects WHERE id = $1",
        [projectId],
      );

      if (projectRow.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      const workspaceId = projectRow.rows[0]!.workspace_id;
      const workspaceMember = await pool.query<{ role: string }>(
        "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
        [workspaceId, user.userId],
      );

      if (workspaceMember.rows.length === 0) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Workspace member but not a project member; return null role
      // Frontend will use this to hide action buttons but still show data
      return res.json({ success: true, data: { role: null } });
    }

    res.json({ success: true, data: { role: member.role } });
  } catch (error) {
    console.error("getProjectMemberRole error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user role" });
  }
};

export const addProjectMember: TypedRequestHandler<ProjectParams, unknown, AddMemberBody> = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, email, role = ProjectRole.Member } = req.body;
    const user = requireUser(req) as AuthTokenPayload;

    // Verify the requester is a project admin/owner OR workspace admin/owner
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const workspaceId = projectRow.rows[0]!.workspace_id;

    const projectRole = await pool.query<{ role: string }>(
      "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, user.userId],
    );
    const workspaceRole = await pool.query<{ role: string }>(
      "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    const projectR = projectRole.rows[0]?.role;
    const workspaceR = workspaceRole.rows[0]?.role;
    const isProjectAdmin = projectR === "owner" || projectR === "admin";
    const isWorkspaceAdmin = workspaceR === "owner" || workspaceR === "admin";

    if (!isProjectAdmin && !isWorkspaceAdmin) {
      return res.status(403).json({ success: false, message: "Only owner or admin can add members" });
    }

    // Find user by id or email
    let targetUserId = userId;
    if (!targetUserId && email) {
      const userResult = await pool.query<{ id: string }>(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      const userRow = userResult.rows[0];
      if (!userRow) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      targetUserId = userRow.id;
    }

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "User ID or email required" });
    }

    // Check if already a member
    const existingMember = await pool.query(
      "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, targetUserId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    // Cannot add someone as 'owner' through this endpoint
    const finalRole = role === ProjectRole.Owner ? ProjectRole.Admin : role;

    await pool.query(
      "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)",
      [projectId, targetUserId, finalRole]
    );

    // Get user details
    const userResult = await pool.query<{ name: string; email: string }>(
      "SELECT name, email FROM users WHERE id = $1",
      [targetUserId]
    );

    res.status(201).json({
      success: true,
      data: {
        projectId,
        userId: targetUserId,
        role: finalRole,
        user: userResult.rows[0],
      },
    });
  } catch (error) {
    console.error("addProjectMember error:", error);
    res.status(500).json({ success: false, message: "Failed to add member" });
  }
};

export const removeProjectMember: TypedRequestHandler<MemberParams> = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const user = requireUser(req) as AuthTokenPayload;

    // Verify the requester is a project admin/owner OR workspace admin/owner
    const projectRow = await pool.query<{ workspace_id: string }>(
      "SELECT workspace_id FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectRow.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const workspaceId = projectRow.rows[0]!.workspace_id;

    const projectRole = await pool.query<{ role: string }>(
      "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, user.userId],
    );
    const workspaceRole = await pool.query<{ role: string }>(
      "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
      [workspaceId, user.userId],
    );

    const projectR = projectRole.rows[0]?.role;
    const workspaceR = workspaceRole.rows[0]?.role;
    const isProjectAdmin = projectR === "owner" || projectR === "admin";
    const isWorkspaceAdmin = workspaceR === "owner" || workspaceR === "admin";

    if (!isProjectAdmin && !isWorkspaceAdmin) {
      return res.status(403).json({ success: false, message: "Only owner or admin can remove members" });
    }

    // Cannot remove the owner
    const targetMember = await pool.query<ProjectMemberRecord>(
      "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId]
    );

    const target = targetMember.rows[0];
    if (target && target.role === ProjectRole.Owner) {
      return res.status(400).json({ success: false, message: "Cannot remove the project owner" });
    }

    await pool.query(
      "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("removeProjectMember error:", error);
    res.status(500).json({ success: false, message: "Failed to remove member" });
  }
};