import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const f = await prisma.followUp.findUnique({ where: { patientId: params.id } })
  return NextResponse.json(f)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data = { nextVisitDate: body.nextVisitDate ? new Date(body.nextVisitDate) : null, homeExercises: body.homeExercises || null, precautions: body.precautions || null, dietaryAdvice: body.dietaryAdvice || null, additionalNotes: body.additionalNotes || null }
  const f = await prisma.followUp.upsert({ where: { patientId: params.id }, update: data, create: { patientId: params.id, ...data } })
  return NextResponse.json(f)
}
