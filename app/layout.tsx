import type { Metadata } from "next";
import { Bebas_Neue, Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "JapanFlip — The Japan Resale Tool",
  description:
    "Standing in a recycle shop in Japan? Check JapanFlip to know if you should buy it. Real sold data from JP and US markets. BUY IT, SKIP IT, or MAYBE — in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${inter.variable} ${dmMono.variable}`}
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
