import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata = {
  title: "Pawmap",
  description: "Find dog-friendly places in Kiel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pawmap",
  },
};

export const viewport = {
  themeColor: "#F0EDE4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}