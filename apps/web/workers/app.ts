import { createRequestHandler } from "@react-router/cloudflare";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - server build is generated at build time
import * as build from "../build/server/index.js";

const requestHandler = createRequestHandler(build, "production");

export default {
  async fetch(request, env, ctx) {
    try {
      return await requestHandler({
        request,
        env,
        ctx,
        waitUntil: ctx.waitUntil.bind(ctx),
        passThroughOnException: ctx.passThroughOnException.bind(ctx),
      });
    } catch {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
