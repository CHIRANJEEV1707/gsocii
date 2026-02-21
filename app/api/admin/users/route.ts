import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminAuth, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { orders: { where: { status: 'paid' } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
