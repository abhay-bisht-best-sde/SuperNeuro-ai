import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { QueryProvider } from "@/(client)/components/query-boundary"
import { cn } from "@/(client)/libs/utils"
import { APP_NAME } from "@/(client)/libs/constants"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
  title: `${APP_NAME} - AI Platform`,
  description: 'Production-ready AI platform for building intelligent applications',
}

export const viewport: Viewport = {
  themeColor: '#1a1025',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "var(--secondary)",
          colorInputBackground: "var(--card)",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          colorBorder: "var(--border)",
          colorInput: "var(--card)",
          borderRadius: "var(--radius)",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={cn(inter.variable, jetbrainsMono.variable, "font-sans antialiased")}>
          <QueryProvider>
              {children}
              <Analytics />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
