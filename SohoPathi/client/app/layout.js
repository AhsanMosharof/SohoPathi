import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sohopathi — AI Study Companion for RUET",
  description: "Upload your course materials and let AI turn them into a personal tutor that knows exactly what you're weak at. Built for RUET students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "oklch(0.14 0.02 270 / 0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid oklch(0.3 0.03 270 / 0.3)",
                color: "oklch(0.95 0.01 270)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
