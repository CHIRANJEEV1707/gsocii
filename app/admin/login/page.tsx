"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      router.push("/admin/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-2xl bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 mb-6 bg-orange-600/10 rounded-xl mx-auto">
          <Lock className="w-6 h-6 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-8">Admin Portal Access</h1>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">
              Admin Email
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">
              Password
            </label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none"
            />
          </div>
          <button
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
