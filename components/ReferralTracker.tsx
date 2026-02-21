"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function ReferralTracker() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")

  useEffect(() => {
    if (ref) {
      fetch("/api/referral/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referralCode: ref }),
      }).catch((err) => console.error("Failed to track referral:", err))
    }
  }, [ref])

  return null
}
