import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/badminton",
          "/florbal",
          "/sauna",
          "/teambuilding",
          "/pronajem-haly",
          "/bistro-krasovska",
          "/bistro",
          "/eshop",
          "/blog",
        ],
        disallow: [
          "/dashboard",
          "/projects",
          "/kanban",
          "/users",
          "/audit",
          "/sessions",
          "/analysis",
          "/prihlaseni",
          "/dokumenty",
          "/eos",
          "/eshop/admin",
          "/eshop/kosik",
          "/eshop/pokladna",
          "/api/",
        ],
      },
    ],
    sitemap: "https://hala-krasovska.vercel.app/sitemap.xml",
  };
}
