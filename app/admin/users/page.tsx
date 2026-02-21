"use client"

import { useEffect, useState } from "react"
import {
  Users as UsersIcon,
  ChevronLeft,
  Mail,
  Phone,
  Link as LinkIcon,
  Tag
} from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mb-12">
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-500 hover:text-white transition-all text-sm mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">User Directory</h1>
        <p className="text-gray-500 text-sm">Manage attendees and track referrals</p>
      </div>

      <div className="overflow-x-auto border border-white/5 bg-gray-950 rounded-2xl">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr className="text-xs uppercase font-bold text-gray-400">
              <th className="p-4">Name & Contact</th>
              <th className="p-4">Referral Code</th>
              <th className="p-4">Referred By</th>
              <th className="p-4">Stats</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                <td className="p-4">
                  <div className="font-bold">{user.name}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Mail className="w-3 h-3 mr-1" /> {user.email}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Phone className="w-3 h-3 mr-1" /> {user.phone}
                  </div>
                </td>
                <td className="p-4">
                  <code className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-bold">
                    {user.referralCode}
                  </code>
                </td>
                <td className="p-4">
                  {user.referredBy ? (
                    <span className="text-xs text-gray-400">{user.referredBy}</span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs">
                      <strong className="text-white">{user.totalReferrals}</strong> Referrals
                    </span>
                    <span className="text-xs">
                      <strong className="text-white">{user._count.orders}</strong> Bundles
                    </span>
                  </div>
                </td>
                <td className="p-4 text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
