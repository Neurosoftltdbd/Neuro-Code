import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const poppins = Geist({
    subsets: ["latin"],
    variable: "--font-poppins",
    display: "swap",
});


export const metadata: Metadata = {
  title: {default:"Neuro soft Ltd | Web Application Development and Mobile Application Development", template: "%s | Neuro soft Ltd"},
  description: "Neuro soft Ltd is a company that specializes in providing services on Web Application Development and Mobile Application Development to help you succeed.",
    keywords: ["Next.js", "React", "JavaScript", "HTML", "CSS", "Flutter"],
    authors: [{ name: "Neuro soft Ltd", url: "https://neurosoftltd.com" }],
    openGraph: {
        title: "Neuro soft Ltd",
        description: "Neuro soft Ltd is a company that specializes in providing services on Web Application Development and Mobile Application Development to help you succeed.",
        images: [
            {
                url: "/favicon.ico",
                width: 800,
                height: 600,
            },
        ],
        siteName: "Neuro soft Ltd",
            },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    twitter: {
        card: "summary_large_image",
        title: "Neuro soft Ltd",
        description: "Neuro soft Ltd is a company that specializes in providing services on Web Application Development and Mobile Application Development to help you succeed.",
        images: [
            {
                url: "/favicon.ico",
                width: 800,
                height: 600,
            },
        ],
    },
    metadataBase: new URL("https://neurosoftltd.com"),


};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-gradient-to-b from-green-600 to-sky-200 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 min-h-screen`}>
      {children}
      </body>
    </html>
  );
}
