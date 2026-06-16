import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PatientHeader } from '@/components/patients/PatientHeader'
import { PatientTabs } from '@/components/patients/PatientTabs'

export default async function PatientLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const patient = await prisma.patient.findUnique({ where: { id: params.id }, include: { treatment: true } })
  if (!patient) notFound()
  return (
    <div className="space-y-6">
      <PatientHeader patient={patient} />
      <PatientTabs patientId={params.id} />
      {children}
    </div>
  )
}
