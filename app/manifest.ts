import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pawmap",
    short_name: "Pawmap",
    description: "Find dog-friendly places in Kiel",
    start_url: "/home",
    display: "standalone",
    background_color: "#F0EDE4",
    theme_color: "#F0EDE4",
    icons: [
      {
        src: "/paw.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}