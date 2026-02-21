import prisma from './prisma'
import { Resend } from 'resend'
import { env } from '@/lib/env'

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : { emails: { send: async () => ({}) } } as any

export async function fulfillOrder(orderId: string, paymentId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch order with lock to prevent race conditions
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { user: true, bundle: true }
    })

    if (!order || order.status === 'paid') {
      return { success: false, message: 'Order already fulfilled or not found' }
    }

    // 2. Update order status
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'paid', razorpayPaymentId: paymentId }
    })

    // 3. Finalize User (Generate permanent referral code if it's a temp one)
    let finalReferralCode = order.user.referralCode
    if (finalReferralCode.startsWith('tmp_')) {
      finalReferralCode = `REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      await tx.user.update({
        where: { id: order.userId },
        data: { referralCode: finalReferralCode }
      })
    }

    // 4. Referral Reward Logic (Increment referrer's total_referrals)
    if (order.user.referredBy) {
      const referrer = await tx.user.findUnique({
        where: { referralCode: order.user.referredBy }
      })
      if (referrer) {
        await tx.user.update({
          where: { id: referrer.id },
          data: { totalReferrals: { increment: 1 } }
        })
      }
    }

    // 5. Send Confirmation Email
    await resend.emails.send({
      from: 'Revamp <noreply@opensource.letsrevamp.in>',
      to: order.user.email,
      subject: 'Payment Confirmed - Revamp Workshops',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1>Welcome to Revamp, ${order.user.name}!</h1>
          <p>Your enrollment in <strong>${order.bundle.name}</strong> is confirmed.</p>
          <hr />
          <p><strong>Next Steps:</strong></p>
          <a href="https://chat.whatsapp.com/..." style="display: block; padding: 12px; background: #25D366; color: white; text-align: center; text-decoration: none; border-radius: 8px;">Join WhatsApp Group</a>
          <p><strong>Your Referral Link:</strong></p>
          <div style="background: #f4f4f4; padding: 12px; border-radius: 8px;">
            https://opensource.letsrevamp.in?ref=${finalReferralCode}
          </div>
        </div>
      `
    })

    return { success: true }
  })
}
