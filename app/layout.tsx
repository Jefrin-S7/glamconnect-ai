import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // Fraunces is a variable font — `weight: "variable"` is required when
  // requesting extra axes (here, the optical-size axis) instead of a
  // fixed weight list, and is what gives the display face its
  // characterful, slightly soft feel at large headline sizes.
  weight: "variable",
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GlamConnect AI — Chennai's AI-matched beauty marketplace",
  description:
    "Discover, compare, and book Chennai's beauty salons — matched to your hair, budget, and schedule by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
