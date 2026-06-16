import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PatientForm } from '@/components/patients/PatientForm'
import { format } from 'date-fns'

export default async function EditPatientPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({ where: { id: params.id } })
  if (!patient) notFound()
  return (
    <div className="max-w-2xl">
      <PatientForm defaultValues={{ id: patient.id, firstName: patient.firstName, lastName: patient.lastName, dateOfBirth: format(patient.dateOfBirth, 'yyyy-MM-dd'), gender: patient.gender, phone: patient.phone, email: patient.email || '', address: patient.address || '' }} />
    </div>
  )
}
