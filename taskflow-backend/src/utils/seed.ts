import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { WorkspaceRole, ProjectRole } from "../types/app.js";

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Clean up existing data to ensure idempotency
    await client.query("BEGIN");
    await client.query("TRUNCATE activity_logs, comments, issues, project_members, projects, workspace_members, workspaces, users CASCADE");
    console.log("🧹 Cleaned existing data.");

    const passwordHash = await bcrypt.hash("Password123!", 10);

    // 2. Create Users
    const users = [
      { name: "Admin User", email: "admin@test.com" },
      { name: "Manager User", email: "manager@test.com" },
      { name: "Member User", email: "member@test.com" },
    ];

    const userIds: string[] = [];
    for (const u of users) {
      const res = await client.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [u.name, u.email, passwordHash]
      );
      userIds.push(res.rows[0].id);
    }
    console.log("👥 Created 3 test users.");

    // 3. Create Workspace
    const wsRes = await client.query(
      "INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING id",
      ["QA Test Workspace", userIds[0]]
    );
    const workspaceId = wsRes.rows[0].id;
    console.log(`🏢 Created workspace: ${workspaceId}`);

    // 4. Assign Workspace Roles
    const wsMembers = [
      { uid: userIds[0], role: WorkspaceRole.Owner },
      { uid: userIds[1], role: WorkspaceRole.Admin },
      { uid: userIds[2], role: WorkspaceRole.Member },
    ];

    for (const m of wsMembers) {
      await client.query(
        "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)",
        [workspaceId, m.uid, m.role]
      );
    }
    console.log("🔑 Assigned workspace roles.");

    // 5. Create Project
    const projRes = await client.query(
      "INSERT INTO projects (name, description, workspace_id) VALUES ($1, $2, $3) RETURNING id",
      ["QA Core Project", "A project for verifying API endpoints", workspaceId]
    );
    const projectId = projRes.rows[0].id;
    console.log(`📁 Created project: ${projectId}`);

    // 6. Assign Project Members
    const projMembers = [
      { uid: userIds[0], role: ProjectRole.Owner },
      { uid: userIds[1], role: ProjectRole.Admin },
      { uid: userIds[2], role: ProjectRole.Member },
    ];

    for (const m of projMembers) {
      await client.query(
        "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)",
        [projectId, m.uid, m.role]
      );
    }
    console.log("🎯 Assigned project roles.");

    // 7. Create Sample Issues
    const issues = [
      { title: "Bug: Login fails", desc: "Login fails on some browsers", priority: "High", status: "Open", uid: userIds[2] },
      { title: "Feature: Dark Mode", desc: "Add dark mode to UI", priority: "Medium", status: "In Progress", uid: userIds[1] },
    ];

    for (const i of issues) {
      await client.query(
        "INSERT INTO issues (project_id, title, description, priority, status, assignee_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [projectId, i.title, i.desc, i.priority, i.status, i.uid]
      );
    }
    console.log("📝 Created sample issues.");

    await client.query("COMMIT");
    console.log("✨ Seeding completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
