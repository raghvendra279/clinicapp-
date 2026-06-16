import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Clinic@2024', 12)
  await prisma.doctor.upsert({
    where: { email: 'dr.gomathi@clinic.com' },
    update: {},
    create: {
      email: 'dr.gomathi@clinic.com',
      passwordHash,
      name: 'Dr. Gomathi',
    },
  })
  console.log('Seed complete.')
  console.log('Login: dr.gomathi@clinic.com / Clinic@2024')
}

main().catch(console.error).finally(() => prisma.$disconnect())
