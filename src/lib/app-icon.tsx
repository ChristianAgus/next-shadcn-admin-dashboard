import { ImageResponse } from "next/og";

import { AppLogo } from "@/components/app-logo";
import { APP_CONFIG } from "@/config/app.config";

export function createAppIcon(size: number) {
  const logoWidth = size * 0.68;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#111111",
        color: "#ffffff",
      }}
    >
      <AppLogo width={logoWidth} height={logoWidth} />
    </div>,
    { width: size, height: size },
  );
}

export const appIconAlt = APP_CONFIG.logo.alt;
