import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../server/src/server.js";
import { createMetricsServer, metricsRegistry } from "../server/src/metrics.js";

async function request(path) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${path}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint reports an unavailable database before MongoDB connects", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable", database: "disconnected" });
});

test("metrics listener exposes Prometheus metrics separately from the API", async () => {
  const metricsServer = await createMetricsServer({ host: "127.0.0.1", port: 0 });
  try {
    const response = await fetch(`http://127.0.0.1:${metricsServer.address().port}/metrics`);
    const body = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/plain/);
    assert.match(body, /# TYPE campuscare_http_requests_total counter/);
    assert.match(body, /# TYPE process_cpu_user_seconds_total counter/);
    assert.match(body, /campuscare_application_up 0/);
  } finally {
    await new Promise((resolve, reject) => metricsServer.close((error) => error ? reject(error) : resolve()));
  }
});

test("metrics record normalized route and status labels", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: "unavailable", database: "disconnected" });

  const body = await metricsRegistry.metrics();
  assert.match(body, /campuscare_http_requests_total\{method="GET",route="\/api\/health",status_code="503"\}/);
  assert.match(body, /campuscare_http_request_duration_seconds_bucket\{le="[^"]+",method="GET",route="\/api\/health",status_code="503"\}/);
});

test("metrics are not exposed on the public API listener", async () => {
  const response = await request("/metrics");
  assert.equal(response.status, 404);
});
