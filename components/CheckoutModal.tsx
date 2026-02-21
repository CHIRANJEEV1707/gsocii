"use client"

import { useState } from "react"
import { X, ChevronRight, CreditCard, QrCode, Loader2 } from "lucide-react"
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
    setStep(2)
  }

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    setLoading(true)
    const res = await initializeRazorpay()

    if (!res) {
      alert("Razorpay SDK failed to load. Check your internet connection.")
      setLoading(false)
      return
    }

    try {
      const data = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: bundle.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      }).then((t) => t.json())

      if (data.error) throw new Error(data.error)

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Revamp Workshops",
        description: bundle.name,
        order_id: data.orderId,
        handler: function (response: any) {
          router.push("/success")
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#ea580c" },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
      onClose()
    } catch (err: any) {
      alert(err.message || "Payment initialization failed")
    } finally {
      setLoading(false)
    }
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

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full flex items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4 text-blue-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Pay via Razorpay</h4>
                  <p className="text-xs text-gray-500">UPI, Cards, Netbanking</p>
                </div>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
              </button>

              <button
                onClick={() => setStep(3)}
                className="w-full flex items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-4 text-green-500">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Manual QR Payment</h4>
                  <p className="text-xs text-gray-500">Scan & Upload Transaction ID</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
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
                  onClick={() => setStep(2)}
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
