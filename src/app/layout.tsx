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
  title: "Toán Mô Hình Hà Nội",
  description: "Cổng thông tin chính thức của Toán Mô Hình Hà Nội — chia sẻ kiến thức toán mô hình, cuộc thi, và tài nguyên cho cộng đồng.",
  metadataBase: new URL("https://blog.helios.id.vn"), // Update with your actual domain
  openGraph: {
    title: "Toán Mô Hình Hà Nội",
    description: "Cổng thông tin chính thức của Toán Mô Hình Hà Nội — chia sẻ kiến thức toán mô hình, cuộc thi, và tài nguyên cho cộng đồng.",
    url: "https://blog.helios.id.vn",
    siteName: "Toán Mô Hình Hà Nội",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Toán Mô Hình Hà Nội",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toán Mô Hình Hà Nội",
    description: "Cổng thông tin chính thức của Toán Mô Hình Hà Nội — chia sẻ kiến thức toán mô hình, cuộc thi, và tài nguyên cho cộng đồng.",
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
