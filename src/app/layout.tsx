import type { Metadata, Viewport } from "next";
import { Lexend, Fira_Code } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Helios - Blog",
  description: "Helios personal blog for sharing my thoughts and experiences",
  metadataBase: new URL("https://blog.helios.id.vn"), // Update with your actual domain
  openGraph: {
    title: "Helios - Blog",
    description: "Helios personal blog for sharing my thoughts and experiences",
    url: "https://blog.helios.id.vn",
    siteName: "Helios Blog",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Helios Blog",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helios - Blog",
    description: "Helios personal blog for sharing my thoughts and experiences",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} ${firaCode.variable} antialiased max-h-screen`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
