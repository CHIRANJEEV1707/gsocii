import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { adminAuth, unauthorizedResponse } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bundles)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await adminAuth(req)
  if (!admin) return unauthorizedResponse()

  try {
    const { id, eventPrice, isActive, isDiscounted } = await req.json()

    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        ...(eventPrice !== undefined ? { eventPrice } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isDiscounted !== undefined ? { isDiscounted } : {}),
      }
    })

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Bundle update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
