import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset & Resource Management",
  description: "Track physical assets end-to-end, manage shared resource bookings, and handle maintenance audits.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-background text-foreground antialiased font-sans">
        {children}
        <Toaster position="top-right" closeButton />
      </body>
    </html>
  )
}
