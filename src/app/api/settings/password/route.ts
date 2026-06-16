import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { currentPassword, newPassword } = await req.json()
  const doctor = await prisma.doctor.findUnique({ where: { email: session.user.email } })
  if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const valid = await bcrypt.compare(currentPassword, doctor.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.doctor.update({ where: { id: doctor.id }, data: { passwordHash } })
  return NextResponse.json({ success: true })
}
