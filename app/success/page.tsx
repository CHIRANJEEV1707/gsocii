"use client"

import { CheckCircle2, Clipboard, Copy, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SuccessPage() {
  const [copied, setCopied] = useState(false)
  const referralLink = "https://opensource.letsrevamp.in?ref=abc123" // Placeholder for now

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black">
      <div className="flex items-center justify-center w-20 h-20 mb-8 bg-green-500/10 rounded-full">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight">Payment Successful!</h1>
      <p className="max-w-md mb-12 text-gray-400">
        You've successfully secured your spot in the Revamp Workshops. Check your
        email for confirmation and next steps.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Community Link */}
        <div className="p-8 text-left border rounded-2xl border-white/5 bg-gray-950">
          <MessageSquare className="w-8 h-8 mb-4 text-orange-500" />
          <h3 className="mb-2 text-xl font-bold">Join Community</h3>
          <p className="mb-6 text-sm text-gray-400">
            Join our exclusive WhatsApp group for workshop attendees and
            mentors.
          </p>
          <Link
            href="https://chat.whatsapp.com/..."
            className="inline-flex items-center justify-center w-full px-6 py-3 font-semibold transition-colors bg-green-600 rounded-xl hover:bg-green-700"
          >
            Join WhatsApp Group
          </Link>
        </div>

        {/* Global Referral */}
        <div className="p-8 text-left border rounded-2xl border-white/5 bg-gray-950">
          <Share2 className="w-8 h-8 mb-4 text-orange-500" />
          <h3 className="mb-2 text-xl font-bold">Refer & Grow</h3>
          <p className="mb-6 text-sm text-gray-400">
            Share your unique referral link and help your friends join the open
            source revolution.
          </p>
          <div className="flex items-center p-3 mb-2 space-x-2 border rounded-lg bg-black/50 border-white/10">
            <code className="flex-1 truncate text-xs text-orange-500">
              {referralLink}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 transition-colors hover:text-orange-500"
            >
              {copied ? <Clipboard className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500">Click to copy your link</p>
        </div>
      </div>

      <Link
        href="/"
        className="mt-12 text-sm font-medium text-gray-500 hover:text-white transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
