import type { Request, Response } from "express";
import pool from "../config/db.js";
import { logActivity } from "../utils/activityLogger.js";
import { requireUser, toNumber, type CommentRecord, type TypedRequestHandler } from "../types/app.js";

interface AddCommentBody {
  issueId?: number | string;
  content?: string;
  workspaceId?: number | string;
}

interface GetCommentsQuery {
  issueId?: string;
}

export const addComment: TypedRequestHandler<never, unknown, AddCommentBody> = async (
  req: Request<never, unknown, AddCommentBody>,
  res: Response,
) => {
  try {
    const { issueId, content, workspaceId } = req.body;
    const userId = requireUser(req).userId;

    const result = await pool.query<CommentRecord>(
      `INSERT INTO comments (issue_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [issueId, userId, content],
    );

    if (workspaceId !== undefined && issueId !== undefined) {
      await logActivity({
        workspaceId: toNumber(workspaceId),
        userId,
        action: "COMMENT_ADDED",
        entityType: "issue",
        entityId: toNumber(issueId),
        metadata: { content },
      });
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getComments: TypedRequestHandler<never, unknown, never, GetCommentsQuery> = async (
  req: Request<never, unknown, never, GetCommentsQuery>,
  res: Response,
) => {
  try {
    const { issueId } = req.query;

    const result = await pool.query<CommentRecord>(
      "SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC",
      [issueId],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch {
    res.status(500).json({ success: false });
  }
};
