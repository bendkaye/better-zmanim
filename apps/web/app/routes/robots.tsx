export function loader() {
  const content = `User-agent: *
Allow: /
Allow: /location/

Sitemap: https://better-zmanim.com/sitemap.xml`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
