import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const r = await prisma.review.findUnique({ where: { patientId: params.id } })
  return NextResponse.json(r)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data = { rating: body.rating, comments: body.comments || null }
  const r = await prisma.review.upsert({ where: { patientId: params.id }, update: data, create: { patientId: params.id, ...data } })
  return NextResponse.json(r)
}
