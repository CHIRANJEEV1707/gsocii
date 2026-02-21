import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { bundleId, name, email, phone, transactionId } = await req.json()

    if (!bundleId || !name || !email || !phone || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Verify bundle
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId }
    })

    if (!bundle || !bundle.isActive) {
      return NextResponse.json({ error: 'Bundle not found or inactive' }, { status: 404 })
    }

    const referralCookie = cookies().get('referral_code')?.value

    // 2. Transactional Upsert & Order creation
    const order = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        update: { name, phone },
        create: {
          name,
          email,
          phone,
          referralCode: `tmp_${Math.random().toString(36).substring(7)}`,
          referredBy: referralCookie || null,
        }
      })

      return await tx.order.create({
        data: {
          userId: user.id,
          bundleId: bundle.id,
          amount: bundle.eventPrice,
          paymentMethod: 'qr',
          status: 'pending',
          razorpayPaymentId: transactionId, // Transaction ID stored here
        }
      })
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Manual payment submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
