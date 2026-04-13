import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const langMatch = cookieHeader.match(/lang=(en|he)/);
  const lang = langMatch ? langMatch[1] : "en";
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
