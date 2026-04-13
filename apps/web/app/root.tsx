import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import { parseCookies } from "./lib/cookies";
import "./app.css";

export function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const lang = cookies.lang ?? "en";
  return { lang };
}

export default function Root() {
  const { lang } = useLoaderData<typeof loader>();
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-apple-black text-white font-body antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const heading = is404 ? "Location not found" : "Something went wrong";
  const message = is404
    ? "Try searching for a city or address."
    : "An unexpected error occurred. Please try again.";

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <title>{heading} | Better Zmanim</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-apple-black text-white font-body antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-[80px] font-semibold leading-none text-white/10">
            {is404 ? "404" : "Error"}
          </p>
          <h1 className="mt-4 font-display text-[28px] font-semibold tracking-tight text-white sm:text-[36px]">
            {heading}
          </h1>
          <p className="mt-2 max-w-[400px] text-[17px] text-white/60">
            {message}
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-[980px] bg-apple-blue px-6 py-2.5 text-[15px] font-medium text-white"
          >
            Go home
          </Link>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
