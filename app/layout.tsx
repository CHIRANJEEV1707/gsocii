import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import ReferralTracker from "@/components/ReferralTracker"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Revamp | Open Source Workshops",
  description: "Level up your open source journey with Revamp.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Suspense fallback={null}>
          <ReferralTracker />
          {children}
        </Suspense>
      </body>
    </html>
  )
}
