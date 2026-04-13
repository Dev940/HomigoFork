import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { createDomainRouter } from "./routes/domainRoutes.js";
import { createCrudRouter } from "./routes/tableRoutes.js";
import { registerSwagger } from "./docs/swagger.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "5mb" }));
  if (env.CLERK_SECRET_KEY) app.use(clerkMiddleware());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "homigo-backend" });
  });
  registerSwagger(app);

  app.use(requireAuth);
  app.use("/api", createDomainRouter());
  app.use("/api", createCrudRouter());

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  return app;
}
