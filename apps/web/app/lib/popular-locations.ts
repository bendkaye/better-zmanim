export const POPULAR_LOCATIONS = [
  { slug: "jerusalem", en: "Jerusalem", he: "ירושלים" },
  { slug: "new-york", en: "New York", he: "ניו יורק" },
  { slug: "los-angeles", en: "Los Angeles", he: "לוס אנג'לס" },
  { slug: "london", en: "London", he: "לונדון" },
  { slug: "tel-aviv-yafo", en: "Tel Aviv", he: "תל אביב" },
  { slug: "chicago", en: "Chicago", he: "שיקגו" },
  { slug: "miami", en: "Miami", he: "מיאמי" },
  { slug: "toronto", en: "Toronto", he: "טורונטו" },
  { slug: "lakewood", en: "Lakewood", he: "לייקווד" },
  { slug: "brooklyn", en: "Brooklyn", he: "ברוקלין" },
  { slug: "baltimore", en: "Baltimore", he: "בולטימור" },
  { slug: "detroit", en: "Detroit", he: "דטרויט" },
  { slug: "monsey", en: "Monsey", he: "מונסי" },
  { slug: "passaic", en: "Passaic", he: "פסאיק" },
  { slug: "teaneck", en: "Teaneck", he: "טינק" },
] as const;

export const POPULAR_SLUGS = POPULAR_LOCATIONS.map((l) => l.slug);
