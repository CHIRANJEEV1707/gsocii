"use client"

import { useState } from "react"
import { X, ChevronRight, QrCode, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CheckoutModalProps {
  bundle: {
    id: string
    name: string
    eventPrice: number
  }
  onClose: () => void
}

export default function CheckoutModal({ bundle, onClose }: CheckoutModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Details, 2: Payment Method, 3: QR Flow
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    transactionId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3) // Skip step 2 (method selection) and go directly to QR
  }

  const handleQRSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/payments/qr-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: bundle.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          transactionId: formData.transactionId,
        }),
      }).then((t) => t.json())

      if (res.error) throw new Error(res.error)
      router.push("/success")
    } catch (err: any) {
      alert(err.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-1">Checkout</h2>
          <p className="text-gray-400 text-sm mb-6">{bundle.name} • ₹{bundle.eventPrice}</p>

          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Full Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9988776655"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all mt-4"
              >
                Continue to Payment
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          )}


          {step === 3 && (
            <form onSubmit={handleQRSubmission} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-2 rounded-xl mb-4">
                  {(() => {
                    const upiId = process.env.NEXT_PUBLIC_UPI_ID;
                    const amount = Math.round(bundle.eventPrice);
                    const upiUrl = `upi://pay?pa=${upiId}&pn=Revamp&am=${amount}&cu=INR`;
                    console.log("Generated UPI URL:", upiUrl);
                    return (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`}
                        alt="UPI QR"
                        className="w-full h-full"
                      />
                    );
                  })()}
                </div>
                <p className="text-xs text-center text-gray-500 mb-6">Scan with any UPI app and pay ₹{Math.round(bundle.eventPrice)}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Transaction ID / UTR</label>
                <input
                  required
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="12 digit number"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-orange-500 outline-none transition-colors"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Submit Details"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
