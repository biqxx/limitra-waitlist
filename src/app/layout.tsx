import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { withBasePath } from "@/lib/base-path";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Limitra | Something Premium Is Coming",
  description: "Join the Limitra waitlist today and get exclusive access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable}`}
      suppressHydrationWarning
      style={{
        "--hero-pattern-image": `url("${withBasePath('/assets/images/herobg.png')}")`,
      } as React.CSSProperties}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const savedTheme = localStorage.getItem("limitra-theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : prefersDark ? "dark" : "light";
                  document.documentElement.dataset.theme = theme;
                } catch {
                  document.documentElement.dataset.theme = "light";
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
