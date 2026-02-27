import { MetadataRoute } from "next";

const BASE_URL = "https://hala-krasovska.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/bistro`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/eshop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic e-shop product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/eshop/products`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const products = await res.json();
      productPages = products
        .filter((p: { active: boolean }) => p.active)
        .map((p: { slug: string; updated_at?: string }) => ({
          url: `${BASE_URL}/eshop/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch {
    // Products API unavailable, skip dynamic pages
  }

  return [...staticPages, ...productPages];
}
