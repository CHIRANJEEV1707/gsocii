import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminAuth, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  try {
    const stats = await prisma.$transaction([
      prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { referredBy: { not: null } } }),
      prisma.order.groupBy({
        by: ['bundleId'] as const,
        where: { status: 'paid' },
        _count: { id: true },
        orderBy: { bundleId: 'asc' }
      })
    ])

    const totalRevenue = stats[0]._sum.amount || 0
    const totalSales = stats[0]._count.id || 0
    const totalUsers = stats[1]
    const referralDriven = stats[2]
    const salesPerBundle = stats[3]

    return NextResponse.json({
      revenue: totalRevenue,
      sales: totalSales,
      users: totalUsers,
      referralSales: referralDriven,
      bundleSales: salesPerBundle,
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
