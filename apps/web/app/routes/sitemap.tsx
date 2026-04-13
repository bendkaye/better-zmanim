import { POPULAR_SLUGS } from "../lib/popular-locations";

export function loader() {
  const baseUrl = "https://better-zmanim.com";
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>`,
    ...POPULAR_SLUGS.map(
      (slug) =>
        `<url><loc>${baseUrl}/location/${slug}</loc><changefreq>daily</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
