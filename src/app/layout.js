// src/app/layout.js

import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";

export const metadata = {
  title: "EU Equipment App",
  description: "Elmhurst University Media Equipment Management",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}