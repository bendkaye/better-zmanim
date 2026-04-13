import type { Route } from "./+types/api.zmanim";
import { fetchZmanim } from "../lib/api.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "0");
  const lng = parseFloat(url.searchParams.get("lng") ?? "0");
  const date =
    url.searchParams.get("date") ??
    new Date().toISOString().split("T")[0]!;
  const tz = url.searchParams.get("tz") ?? "UTC";

  const api = (context.cloudflare as { env: { API: Fetcher } }).env.API;
  const result = await fetchZmanim(api, { lat, lng, date, tz });

  if (!result.data) {
    throw new Response("Failed to load zmanim", { status: 500 });
  }

  return { zmanimResponse: result.data };
}
