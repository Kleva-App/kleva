import { getOptionalEnv } from "./lib/env.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { roleFromAuthRequest, runWithSignupRole } from "./lib/signup-role.js";
import { aiRouter } from "./routes/ai.js";
import { attendanceRouter } from "./routes/attendance.js";
import { conversationsRouter } from "./routes/conversations.js";
import { coursesRouter } from "./routes/courses.js";
import { demoRequestsRouter } from "./routes/demo-requests.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { profilesRouter } from "./routes/profiles.js";
import { rolesRouter } from "./routes/roles.js";
import { submissionsRouter } from "./routes/submissions.js";
import { teacherRouter } from "./routes/teacher.js";
import { parentRouter } from "./routes/parent.js";
import { invitationsRouter } from "./routes/invitations.js";
import { emailPreviewRouter } from "./routes/email-preview.js";
import { financeRouter } from "./routes/finance.js";
import { schoolAdminRouter } from "./routes/school-admin.js";
import { siteAccessRouter } from "./routes/site-access.js";

const app = express();
const port = Number(getOptionalEnv("PORT", "3001"));

app.use(helmet({ crossOriginResourcePolicy: false }));
// Reflect request Origin so credentialed cookies work from any frontend.
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// better-auth must run before express.json()
app.all("/api/auth/*", (req, _res, next) => {
  runWithSignupRole(roleFromAuthRequest(req), next);
});
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", siteAccessRouter);
app.use("/api", demoRequestsRouter);
app.use("/api", meRouter);
app.use("/api", profilesRouter);
app.use("/api", rolesRouter);
app.use("/api", conversationsRouter);
app.use("/api", coursesRouter);
app.use("/api", submissionsRouter);
app.use("/api", attendanceRouter);
app.use("/api", teacherRouter);
app.use("/api", parentRouter);
app.use("/api", invitationsRouter);
app.use("/api", emailPreviewRouter);
app.use("/api", financeRouter);
app.use("/api", schoolAdminRouter);
app.use("/api", aiRouter);

app.get("/", (_req, res) => {
  res.json({ name: "@nudle/server", docs: "/api/health" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`);
});
