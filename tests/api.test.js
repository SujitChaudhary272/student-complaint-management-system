import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../server/src/server.js";

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

test("metrics endpoint uses Prometheus text exposition format", async () => {
  const response = await request("/metrics");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/plain/);
  assert.match(await response.text(), /# TYPE campuscare_http_requests_total counter/);
});
