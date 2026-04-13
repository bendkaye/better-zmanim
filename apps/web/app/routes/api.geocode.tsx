import type { Route } from "./+types/api.geocode";
import { fetchGeocode } from "../lib/api.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";

  if (!q) {
    return { results: [] };
  }

  const api = (context.cloudflare as { env: { API: Fetcher } }).env.API;
  const result = await fetchGeocode(api, q);

  return { results: result.data?.results ?? [] };
}
