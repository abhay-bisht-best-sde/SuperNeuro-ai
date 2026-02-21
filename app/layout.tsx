import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import "./globals.css"

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: 'SuperNeuro.ai - AI Platform',
  description: 'Production-ready AI platform for building intelligent applications',
}

export const viewport: Viewport = {
  themeColor: '#1a1025',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <>
      {children}
      <Analytics />
    </>
  )

  return (
    <html lang="en" className="dark">
      <body className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey} appearance={{ baseTheme: dark }}>
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  )
}
