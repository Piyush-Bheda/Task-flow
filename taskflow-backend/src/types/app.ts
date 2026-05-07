import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

export enum WorkspaceRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}

export interface AuthTokenPayload {
  userId: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload;
}

export interface ErrorWithMessage {
  message: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface WorkspaceRecord {
  id: number;
  name: string;
  owner_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface WorkspaceMemberRecord {
  workspace_id: number;
  user_id: number;
  role: WorkspaceRole;
}

export interface ProjectRecord {
  id: number;
  workspace_id: number;
  name: string;
  description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface IssueRecord {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  assignee_id: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CommentRecord {
  id: number;
  issue_id: number;
  user_id: number;
  content: string;
  created_at?: Date;
}

export interface ActivityLogRecord {
  id?: number;
  workspace_id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: Record<string, unknown>;
  created_at?: Date;
}

export interface CountRow {
  count: string;
}

export interface StatusCountRow {
  status: string | null;
  count: string;
}

export interface PriorityCountRow {
  priority: string | null;
  count: string;
}

export interface IssuesOverTimeRow {
  week: string;
  status: string | null;
  count: string;
}

export interface ProjectIssueCountRow {
  name: string;
  count: string;
}

export interface RoleRow {
  role: WorkspaceRole;
}

export type TypedRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>;

/**
 * Controllers and downstream middleware only run after `authMiddleware`, but
 * Express' ambient `Request` type cannot encode per-route guarantees. This
 * helper narrows at runtime and gives later code a concrete user shape.
 */
export function requireUser<TRequest extends Request>(req: TRequest): AuthTokenPayload {
  if (!req.user) {
    throw new Error("Authenticated user missing from request");
  }

  return req.user;
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === "object" && error !== null && "message" in error;
}

export function getErrorMessage(error: unknown): string {
  return isErrorWithMessage(error) ? error.message : "Unknown error";
}

export function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export function asyncHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
>(
  handler: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<unknown>,
): TypedRequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
