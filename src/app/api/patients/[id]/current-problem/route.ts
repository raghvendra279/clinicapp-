import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const data = {
    chiefComplaint: body.chiefComplaint,
    severity: body.severity,
    onsetDate: body.onsetDate ? new Date(body.onsetDate) : null,
    description: body.description || null,
    aggravatingFactors: body.aggravatingFactors || null,
    relievingFactors: body.relievingFactors || null,
  }
  const problem = await prisma.currentProblem.upsert({
    where: { patientId: params.id },
    update: data,
    create: { patientId: params.id, ...data },
  })
  return NextResponse.json(problem)
}
