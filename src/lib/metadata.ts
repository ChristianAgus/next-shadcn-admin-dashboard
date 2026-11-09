import type { Metadata } from "next";

import { APP_CONFIG } from "@/config/app.config";

interface MetadataInput {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

/** Builds page metadata from central config so titles never drift. */
export function createMetadata({ title, description, path, noIndex }: MetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.meta.title;

  return {
    metadataBase: new URL(APP_CONFIG.url),
    applicationName: APP_CONFIG.name,
    // The root layout title template appends the application name.
    title,
    description: description ?? APP_CONFIG.meta.description,
    authors: [{ name: APP_CONFIG.company.name, url: APP_CONFIG.links.website }],
    alternates: path ? { canonical: path } : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: APP_CONFIG.name,
      title: fullTitle,
      description: description ?? APP_CONFIG.meta.description,
      locale: APP_CONFIG.locale.replace("-", "_"),
      url: path ? `${APP_CONFIG.url}${path}` : APP_CONFIG.url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description ?? APP_CONFIG.meta.description,
    },
  };
}
