import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import Sentry from "./config/sentry.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import activityRoutes from "./routes/activity.route.js";
import authRoutes from "./routes/auth.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import projectRoutes from "./routes/project.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import { requireUser } from "./types/app.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/test-error", (_req, _res) => {
  throw new Error("Sentry test error");
});

app.get("/", (_req, res) => {
  res.send("API is running");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  const user = requireUser(req);

  return res.json({
    success: true,
    user: {
      id: user.userId,
    },
  });
});

Sentry.setupExpressErrorHandler(app);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const port = process.env.PORT ?? 5000;
const entryFile = process.argv[1] ?? "";

if (entryFile.endsWith("index.js") || entryFile.endsWith("index.ts")) {
  app.listen(port, () => console.log(`Server running on ${port}`));
}

export default app;
