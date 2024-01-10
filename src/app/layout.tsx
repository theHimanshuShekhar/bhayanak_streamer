import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bhayanak Streamer",
  description: "Watchparties for Bhayanak people!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <head />
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen p-2 sm:container">
                <NavBar />
                <div className="grow">{children}</div>
                <Footer />
              </div>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
