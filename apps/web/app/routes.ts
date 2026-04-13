import { type RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/location/:slug", "routes/location.tsx"),
] satisfies RouteConfig;
