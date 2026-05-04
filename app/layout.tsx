import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Francis Onyido — Security Researcher & Penetration Tester",
  description:
    "Cybersecurity portfolio of Francis Onyido — penetration tester, security researcher, and CTF player.",
  keywords: ["cybersecurity", "penetration testing", "security researcher", "HackTheBox", "Francis Onyido"],
  metadataBase: new URL("https://frankloginss.github.io/devfrancis-portfolio"),
  openGraph: {
    title: "Francis Onyido — Security Researcher & Penetration Tester",
    description: "Cybersecurity portfolio of Francis Onyido.",
    url: "https://frankloginss.github.io/devfrancis-portfolio",
    siteName: "Francis Onyido",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Francis Onyido — Security Researcher & Penetration Tester",
    description: "Cybersecurity portfolio of Francis Onyido.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
