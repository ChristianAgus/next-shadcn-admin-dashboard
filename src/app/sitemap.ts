import type { MetadataRoute } from "next";

import { APP_CONFIG } from "@/config/app.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${APP_CONFIG.url}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
