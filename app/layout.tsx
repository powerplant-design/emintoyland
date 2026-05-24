import React from "react";
import { Metadata } from "next";
import { Poppins } from "next/font/google";

import "@/styles.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Em in Toyland",
  description: "Emma Hewitt-Johnson — Sexologist, Educator & Writer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
