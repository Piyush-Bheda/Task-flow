-- Migration: Create project_members table
-- This table stores project-specific roles for users

CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- Add comments
COMMENT ON TABLE project_members IS 'Stores project-specific roles for users';
COMMENT ON COLUMN project_members.project_id IS 'Reference to projects table';
COMMENT ON COLUMN project_members.user_id IS 'Reference to users table';
COMMENT ON COLUMN project_members.role IS 'Project role: owner, admin, or member';
COMMENT ON COLUMN project_members.created_at IS 'When the member was added to the project';

-- Migration to add owner as default project member when project is created via trigger
-- Note: This is handled in the application code (project.controller.ts) for now