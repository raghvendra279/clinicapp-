import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { medicalRecord: true, currentProblem: true, prescriptions: { include: { medications: true }, orderBy: { createdAt: 'desc' } }, sessions: { orderBy: { sessionDate: 'desc' } }, progressLogs: { orderBy: { logDate: 'desc' } }, treatment: true, followUp: true, review: true },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: { firstName: body.firstName, lastName: body.lastName, dateOfBirth: new Date(body.dateOfBirth), gender: body.gender, phone: body.phone, email: body.email || null, address: body.address || null },
  })
  return NextResponse.json(patient)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.patient.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
