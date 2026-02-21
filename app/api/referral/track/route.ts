import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { referralCode } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0'

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    // Check if referral code is valid (optional, but good for data integrity)
    const user = await prisma.user.findUnique({
      where: { referralCode }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Capture the click
    await prisma.referralClick.create({
      data: {
        referralCode,
        visitorIp: ip,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Referral click tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
