import packageJson from "../../package.json";
import { env } from "./env";

const currentYear = new Date().getFullYear();
const companyName = env.NEXT_PUBLIC_APP_NAME;

/**
 * Central application configuration.
 *
 * Change the values in this file (or the related environment variables) to
 * rebrand the whole boilerplate. Components should read from here instead of
 * hardcoding product names, titles, links, or copyright text.
 */
export const APP_CONFIG = {
  name: companyName,
  shortName: companyName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase(),
  title: `${companyName} — E-commerce Admin`,
  description:
    "A reusable e-commerce admin dashboard boilerplate built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. Comes with mock data, role-based access control, and an API-ready data layer.",
  url: env.NEXT_PUBLIC_APP_URL,
  version: packageJson.version,
  company: {
    name: companyName,
    email: "hello@example.com",
    phone: "+62 21 555 0100",
    address: "Jl. Example No. 1, Jakarta, Indonesia",
  },
  copyright: `© ${currentYear} ${companyName}. All rights reserved.`,
  logo: {
    src: "/logo.svg",
    alt: `${companyName} logo`,
    width: 32,
    height: 32,
  },
  favicon: {
    src: "/icon",
  },
  locale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  language: env.NEXT_PUBLIC_DEFAULT_LOCALE.split("-")[0] ?? "en",
  currency: env.NEXT_PUBLIC_CURRENCY,
  meta: {
    title: `${companyName} — E-commerce Admin`,
    description:
      "Manage products, categories, orders, customers, users, and roles from a single reusable admin dashboard.",
  },
  links: {
    website: env.NEXT_PUBLIC_APP_URL,
    support: "mailto:hello@example.com",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
