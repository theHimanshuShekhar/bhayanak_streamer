import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bhaynak Streamer",
  description: "Watchparties for Bhayanak people!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen container">
              <NavBar />
              <div className="grow">{children}</div>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
