"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  ExternalLink,
  Loader2,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleApprove = async (orderId: string) => {
    if (!confirm("Are you sure you want to approve this payment?")) return
    setProcessing(orderId)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "approve" }),
      })
      if (!res.ok) throw new Error("Approval failed")
      fetchOrders()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="mb-12">
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-500 hover:text-white transition-all text-sm mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-gray-500 text-sm">Approve manual payments and track sales</p>
      </div>

      <div className="overflow-x-auto border border-white/5 bg-gray-950 rounded-2xl">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr className="text-xs uppercase font-bold text-gray-400">
              <th className="p-4">User</th>
              <th className="p-4">Bundle</th>
              <th className="p-4">Method</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                <td className="p-4">
                  <div className="font-bold">{order.user.name}</div>
                  <div className="text-xs text-gray-500">{order.user.email}</div>
                  <div className="text-xs text-gray-500">{order.user.phone}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-white/5 rounded text-xs font-medium">
                    {order.bundle.name}
                  </span>
                </td>
                <td className="p-4 capitalize">{order.paymentMethod}</td>
                <td className="p-4 font-bold text-orange-500">₹{order.amount}</td>
                <td className="p-4">
                  {order.status === "paid" ? (
                    <span className="flex items-center text-green-500 text-xs font-bold uppercase">
                      <Check className="w-4 h-4 mr-1" /> Paid
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-500 text-xs font-bold uppercase">
                      <Clock className="w-4 h-4 mr-1" /> {order.status}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {order.status === "pending" && order.paymentMethod === "qr" && (
                    <button
                      onClick={() => handleApprove(order.id)}
                      disabled={processing === order.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all flex items-center"
                    >
                      {processing === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                      Approve
                    </button>
                  )}
                  {order.paymentMethod === "razorpay" && (
                    <span className="text-gray-600 text-xs">Auto-verified</span>
                  )}
                  {order.status === "paid" && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
