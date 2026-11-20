import { Inter, Playfair_Display } from "next/font/google"

import "./globals.css"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { TokenStoreProvider } from "@/lib/token-store"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        playfair.variable,
        "font-sans"
      )}
    >
      <body>
        <SiteHeader />
        <ThemeProvider>
          <TokenStoreProvider>{children}</TokenStoreProvider>
        </ThemeProvider>
        <SiteFooter />
      </body>
    </html>
  )
}
