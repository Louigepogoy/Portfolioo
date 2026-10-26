import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "Louie | Full-Stack Web Developer";
const description =
  "Portfolio of Louie, a full-stack web developer from the Philippines building with React, Next.js and Express. Creator of JLR Fleetlink and GameVault.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description, url: SITE_URL, siteName: "Louie.dev", type: "website", locale: "en_PH" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport = { themeColor: "#0b0a14" };

// Applies the saved theme before first paint so the page never flashes the wrong colors.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
