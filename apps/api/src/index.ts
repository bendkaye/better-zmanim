import { Hono } from "hono";
import { cors } from "hono/cors";
import { zmanimRoutes } from "./routes/zmanim";
import { hebdateRoutes } from "./routes/hebdate";
import { logger } from "./lib/logger";

export type Env = {
  GEOCODE_CACHE: KVNamespace;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info("request", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  });
});

app.route("/api/zmanim", zmanimRoutes);
app.route("/api/hebdate", hebdateRoutes);

app.get("/api/health", (c) => {
  return c.json({ data: { status: "ok" }, error: null });
});

app.notFound((c) => {
  return c.json(
    { data: null, error: { code: "NOT_FOUND", message: "Not found" } },
    404,
  );
});

export default app;
