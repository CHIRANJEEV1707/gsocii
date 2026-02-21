import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const { bundleId, name, email, phone } = await req.json()

    if (!bundleId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Verify bundle exists and is active
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId }
    })

    if (!bundle || !bundle.isActive) {
      return NextResponse.json({ error: 'Bundle not found or inactive' }, { status: 404 })
    }

    const referralCookie = cookies().get('referral_code')?.value

    // 2. Wrap User & Order creation in a transaction to ensure integrity
    const { order, user } = await prisma.$transaction(async (tx) => {
      // Upsert user to avoid unique constraint issues during race conditions
      const userRecord = await tx.user.upsert({
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

      // Create a pending order record BEFORE calling external Razorpay API
      const orderRecord = await tx.order.create({
        data: {
          userId: userRecord.id,
          bundleId: bundle.id,
          amount: bundle.eventPrice,
          paymentMethod: 'razorpay',
          status: 'pending',
        }
      })

      return { order: orderRecord, user: userRecord }
    })

    // 3. Create Razorpay Order
    // Note: If this fails, we have a pending order record, which is fine (user can retry)
    const amount = Math.round(bundle.eventPrice * 100)
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${order.id}`,
      notes: { orderId: order.id, userId: user.id }
    })

    // 4. Update the DB order with the external Razorpay Order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayPaymentId: razorpayOrder.id }
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: env.NEXT_PUBLIC_RAZORPAY_KEY,
      dbOrderId: order.id,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
