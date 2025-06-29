import type React from "react"
import { Outfit } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { InventoryProvider } from "@/contexts/InventoryContext"
import { BatchProvider } from "@/contexts/BatchContext"
import { ApprovalProvider } from "@/contexts/ApprovalContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import "./globals.css"

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-outfit min-h-screen bg-background text-foreground transition-colors duration-300 antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <InventoryProvider>
              <BatchProvider>
                <ApprovalProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </ApprovalProvider>
              </BatchProvider>
            </InventoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
