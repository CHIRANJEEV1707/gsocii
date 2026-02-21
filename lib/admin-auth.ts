import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'

const JWT_SECRET = env.JWT_SECRET

export async function adminAuth(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
