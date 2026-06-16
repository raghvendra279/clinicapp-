import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const prescriptions = await prisma.prescription.findMany({ where: { patientId: params.id }, include: { medications: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(prescriptions)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const prescription = await prisma.prescription.create({
    data: {
      patientId: params.id,
      notes: body.notes || null,
      medications: {
        create: body.medications.map((m: { name: string; dosage: string; frequency: string; duration: string; instructions: string }) => ({
          name: m.name, dosage: m.dosage || '', frequency: m.frequency || '', duration: m.duration || '', instructions: m.instructions || null,
        })),
      },
    },
    include: { medications: true },
  })
  return NextResponse.json(prescription, { status: 201 })
}
