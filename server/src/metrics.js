import http from "node:http";
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics
} from "prom-client";

const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

const httpRequestsTotal = new Counter({
  name: "campuscare_http_requests_total",
  help: "Total HTTP responses served by the CampusCare API.",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry]
});

const httpRequestDuration = new Histogram({
  name: "campuscare_http_request_duration_seconds",
  help: "HTTP response duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry]
});

const applicationUp = new Gauge({
  name: "campuscare_application_up",
  help: "Whether the CampusCare application and metrics listeners are ready.",
  registers: [metricsRegistry]
});
applicationUp.set(0);

function normalizedRoute(req) {
  if (req.route?.path) {
    const route = Array.isArray(req.route.path) ? req.route.path[0] : req.route.path;
    return `${req.baseUrl || ""}${route}` || "/";
  }
  return "unmatched";
}

export function metricsMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const route = normalizedRoute(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSeconds);
  });
  next();
}

export async function metricsHandler(_req, res) {
  res.setHeader("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
}

export function createMetricsServer({ host, port }) {
  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/metrics") {
      metricsHandler(req, res).catch((error) => {
        console.error("Metrics collection failed:", error);
        res.statusCode = 500;
        res.end("Metrics unavailable\n");
      });
      return;
    }
    res.statusCode = 404;
    res.end("Not found\n");
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

export { applicationUp, metricsRegistry };
