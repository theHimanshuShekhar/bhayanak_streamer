import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { shadesOfPurple } from "@clerk/themes";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import "./globals.css";

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
      <ClerkProvider
        appearance={{
          baseTheme: shadesOfPurple,
        }}
      >
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
                <div className="grow min-h-vh overflow-x-auto overflow-y-hidden flex flex-col">
                  {children}
                </div>
                <Footer />
              </div>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
