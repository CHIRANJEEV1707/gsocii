const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
require('dotenv').config()

const prisma = new PrismaClient()

async function check() {
  try {
    const email = 'letsrevamp.here@gmail.com'
    const password = 'GSoC60@restart'

    console.log('Checking user:', email)
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.log('User not found in database')
      return
    }

    console.log('User found. Password hash:', user.passwordHash)

    if (!user.passwordHash) {
      console.log('User has no password hash')
      return
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    console.log('Password match result:', match)

  } catch (err) {
    console.error('Check failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

check()
