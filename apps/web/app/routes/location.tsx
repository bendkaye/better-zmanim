import type { Route } from "./+types/location";

export function loader({ params }: Route.LoaderArgs) {
  return { slug: params.slug };
}

export default function Location({ loaderData }: Route.ComponentProps) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-semibold font-display tracking-tight">
        {loaderData.slug}
      </h1>
    </main>
  );
}
