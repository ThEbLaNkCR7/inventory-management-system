import type React from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { InventoryProvider } from "@/contexts/InventoryContext"
import { BatchProvider } from "@/contexts/BatchContext"
import { ApprovalProvider } from "@/contexts/ApprovalContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <InventoryProvider>
              <BatchProvider>
                <ApprovalProvider>{children}</ApprovalProvider>
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
