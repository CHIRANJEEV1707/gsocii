import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { fulfillOrder } from '@/lib/fulfillment'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const payload = event.payload.payment.entity

    if (event.event === 'payment.captured') {
      const razorpayOrderId = payload.order_id
      const razorpayPaymentId = payload.id

      // 1. Find the local order by Razorpay Order ID
      const order = await prisma.order.findFirst({
        where: { razorpayPaymentId: razorpayOrderId },
      })

      if (!order) {
        console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // 2. Use shared fulfillment logic
      const result = await fulfillOrder(order.id, razorpayPaymentId)

      if (!result.success) {
        // Log but return OK to Razorpay to prevent retries if it's already processed
        console.warn(`Webhook fulfillment warning: ${result.message}`)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Always return 200 or 500 carefully; Razorpay will retry on failures.
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
