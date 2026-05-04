import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "./site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "ResumeFit",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a18",
    theme_color: "#c8a96e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
