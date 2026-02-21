import BundleCard from "@/components/BundleCard"
import { Shield, Users, Zap, Award } from "lucide-react"

const BUNDLES = [
  {
    id: "gsoc-intensive",
    name: "GSOC INTENSIVE",
    originalPrice: 1999,
    eventPrice: 999,
    isDiscounted: true,
    features: [
      "Deep dive into GSoC proposals",
      "Organization selection strategy",
      "1-on-1 proposal review",
      "Project contribution guide",
    ],
    isPrimary: true,
  },
  {
    id: "opensource-starter",
    name: "OPENSOURCE STARTER",
    originalPrice: 1499,
    eventPrice: 699,
    isDiscounted: true,
    features: [
      "Git & GitHub fundamentals",
      "First contribution walkthrough",
      "Finding beginner-friendly issues",
      "Discord community access",
    ],
    isPrimary: false,
  },
  {
    id: "opensource-specific",
    name: "OPENSOURCE SPECIFIC",
    originalPrice: 1500,
    eventPrice: 1500,
    isDiscounted: false,
    features: [
      "Custom organization training",
      "Specific toolkit mastery",
      "Advanced debugging sessions",
      "Maintainer communication tips",
    ],
    isPrimary: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-orange-500/30">
      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden text-center px-6">
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(234,88,12,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium border rounded-full bg-white/5 border-white/10 text-orange-500">
            <Zap className="w-4 h-4" />
            <span>Revamp Event Live</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl">
            Master <span className="text-orange-600">Open Source.</span>
            <br />
            Secure Your Future.
          </h1>
          <p className="max-w-2xl mx-auto mt-8 text-lg text-gray-400 md:text-xl">
            Production-ready workshops to help you contribute to the world's most
            impactful software. Join 100k+ developers.
          </p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container max-w-6xl py-24 mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} {...bundle} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-white/5 bg-gray-950/20 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-600/10 rounded-xl">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold">Secure Infrastructure</h3>
              <p className="text-gray-400">
                Enterprise-grade security for 100k users. Payments powered by
                Razorpay.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-600/10 rounded-xl">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold">Referral Network</h3>
              <p className="text-gray-400">
                Boost your impact. Join our referral program and lead the open
                source movement.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-600/10 rounded-xl">
                <Award className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold">Proven Curriculum</h3>
              <p className="text-gray-400">
                Battle-tested workshops designed for real-world contributions and
                GSoC success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm px-6">
        <p>&copy; 2024 Revamp. All rights reserved. opensource.letsrevamp.in</p>
      </footer>
    </div>
  )
}
