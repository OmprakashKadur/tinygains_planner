import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/planner/"],
    },
    sitemap: "https://focusflow.pro/sitemap.xml", // Replace with actual domain
  };
}
