import { type RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/location/:slug", "routes/location.tsx"),
  route("/api/zmanim", "routes/api.zmanim.tsx"),
  route("/api/geocode", "routes/api.geocode.tsx"),
  route("/robots.txt", "routes/robots.tsx"),
  route("/sitemap.xml", "routes/sitemap.tsx"),
] satisfies RouteConfig;
