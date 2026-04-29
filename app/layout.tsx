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
  title: "DevFrancis — Security Researcher & Penetration Tester",
  description:
    "Cybersecurity portfolio of DevFrancis — penetration tester, security researcher, and CTF player.",
  keywords: ["cybersecurity", "penetration testing", "security researcher", "HackTheBox", "DevFrancis"],
  metadataBase: new URL("https://frankloginss.github.io/devfrancis-portfolio"),
  openGraph: {
    title: "DevFrancis — Security Researcher & Penetration Tester",
    description: "Cybersecurity portfolio of DevFrancis.",
    url: "https://frankloginss.github.io/devfrancis-portfolio",
    siteName: "DevFrancis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFrancis — Security Researcher & Penetration Tester",
    description: "Cybersecurity portfolio of DevFrancis.",
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
