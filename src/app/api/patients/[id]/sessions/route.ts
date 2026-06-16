import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sessions = await prisma.session.findMany({ where: { patientId: params.id }, orderBy: { sessionDate: 'desc' } })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const s = await prisma.session.create({
    data: { patientId: params.id, sessionDate: new Date(body.sessionDate), sessionType: body.sessionType, durationMins: body.durationMins, therapistNotes: body.therapistNotes || null },
  })
  return NextResponse.json(s, { status: 201 })
}
