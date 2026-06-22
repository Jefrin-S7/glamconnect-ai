import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
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
        {/* Skip navigation — visible on focus, hidden otherwise.
            Keyboard and screen-reader users land here first and can
            bypass the navbar in a single Tab press. */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-violet focus-visible:text-white focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-full focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
