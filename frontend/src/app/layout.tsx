import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "SUUMO Clone - 賃貸物件検索",
  description: "理想の賃貸物件を探そう",
  icons: {
    icon: [
      { url: '/suumo-logo.svg', type: 'image/svg+xml' },
      { url: '/suumo-logo.webp', type: 'image/webp' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
