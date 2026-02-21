// Simulate the app's login logic exactly
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Mock the lib/env behavior
const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
})

async function debugLogin() {
  console.log('--- DEBUG LOGIN START ---')
  try {
    const email = 'letsrevamp.here@gmail.com'
    const password = 'GSoC60@restart'

    console.log('1. Fetching user from DB...')
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('Result: User NOT FOUND (should be 401)')
      return
    }

    console.log('2. User found. Comparing passwords...')
    console.log('Stored Hash:', user.passwordHash)

    if (!user.passwordHash) {
      console.log('Result: User has no hash (should be 401)')
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    console.log('3. Password match result:', passwordMatch)

    if (passwordMatch) {
      console.log('4. Generating JWT...')
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: "admin" },
        env.JWT_SECRET,
        { expiresIn: "1d" }
      )
      console.log('Result: SUCCESS. Token generated.')
    } else {
      console.log('Result: PASSWORD MISMATCH (should be 401)')
    }

  } catch (error) {
    console.error('--- CRASH DETECTED (Result: 500) ---')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()
