import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const logs = await prisma.progressLog.findMany({ where: { patientId: params.id }, orderBy: { logDate: 'desc' } })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const log = await prisma.progressLog.create({
    data: { patientId: params.id, logDate: new Date(body.logDate), painScale: body.painScale, mobilityScore: body.mobilityScore ?? null, exercisesDone: body.exercisesDone || null, notes: body.notes || null },
  })
  return NextResponse.json(log, { status: 201 })
}
