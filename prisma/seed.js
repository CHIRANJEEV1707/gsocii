require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('Seeding database...')
  console.log('DATABASE_URL detected:', !!process.env.DATABASE_URL)

  // 1. Clear existing data (optional, use with caution)
  // await prisma.order.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.bundle.deleteMany()

  // 2. Create Bundles
  const bundles = [
    {
      name: "GSOC INTENSIVE",
      originalPrice: 1999,
      eventPrice: 999,
      isDiscounted: true,
      isActive: true,
    },
    {
      name: "OPENSOURCE STARTER",
      originalPrice: 1499,
      eventPrice: 699,
      isDiscounted: true,
      isActive: true,
    },
    {
      name: "OPENSOURCE SPECIFIC",
      originalPrice: 1500,
      eventPrice: 1500,
      isDiscounted: false,
      isActive: true,
    },
  ]

  for (const b of bundles) {
    await prisma.bundle.upsert({
      where: { id: b.id || 'placeholder' }, // Hack for id-less bundles in seed
      update: {},
      create: b,
    }).catch(async (e) => {
      // Fallback for upsert without ID
      await prisma.bundle.create({ data: b })
    })
  }

  // 3. Create Admin User
  const adminEmail = 'letsrevamp.here@gmail.com'
  const hashedPassword = await bcrypt.hash('REvamp@GSOC69', 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword },
    create: {
      name: 'Admin Revamp',
      email: adminEmail,
      phone: '0000000000',
      passwordHash: hashedPassword,
      referralCode: 'REVAMP-ROOT',
    },
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
