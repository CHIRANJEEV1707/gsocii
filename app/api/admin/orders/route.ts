import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { fulfillOrder } from '@/lib/fulfillment'

export async function GET(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const bundleId = searchParams.get('bundleId')

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(bundleId ? { bundleId } : {}),
      },
      include: {
        user: true,
        bundle: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  try {
    const { orderId, action } = await req.json()

    if (action === 'approve') {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const result = await fulfillOrder(orderId, order.razorpayPaymentId || 'manual_approval')

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Order approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
