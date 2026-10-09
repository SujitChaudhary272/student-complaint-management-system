import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import { ensureAdminAccount, seedDemoData } from "./seed.js";
import { applicationUp, createMetricsServer, metricsMiddleware } from "./metrics.js";

const app = express();
app.use(metricsMiddleware);
app.use(helmet({ contentSecurityPolicy: false }));
// The production frontend and API share one origin. CORS is only enabled when
// a separate client URL is explicitly configured.
app.use(cors({ origin: config.isProduction ? config.clientUrl || false : true }));
app.use(express.json({ limit: "100kb" }));
app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use("/api/complaints", complaintRoutes);
app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "unavailable", database: connected ? "connected" : "disconnected" });
});
app.all("/metrics", (_req, res) => res.sendStatus(404));

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, "../../client/dist");
if (config.isProduction) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors)[0].message });
  if (error?.code === 11000) return res.status(409).json({ message: "A complaint with this reference already exists. Please submit it again." });
  res.status(500).json({ message: "An unexpected error occurred." });
});

export { app };

export async function startServer() {
  mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error.message));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected."));
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await ensureAdminAccount();
  if (process.env.SEED_DEMO_DATA === "true") await seedDemoData();
  app.listen(config.port, () => console.log(`CampusCare API listening on ${config.port}`));
  await createMetricsServer({ host: config.metricsHost, port: config.metricsPort });
  applicationUp.set(1);
  console.log(`CampusCare metrics listening on ${config.metricsHost}:${config.metricsPort}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => { console.error("MongoDB connection failed:", error); process.exit(1); });
}
