import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const patients = await prisma.patient.findMany({
    where: q ? { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }] } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { treatment: true },
  })
  return NextResponse.json(patients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const patient = await prisma.patient.create({
    data: { firstName: body.firstName, lastName: body.lastName, dateOfBirth: new Date(body.dateOfBirth), gender: body.gender, phone: body.phone, email: body.email || null, address: body.address || null },
  })
  return NextResponse.json(patient, { status: 201 })
}
