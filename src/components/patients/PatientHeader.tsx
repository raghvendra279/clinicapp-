import { differenceInYears } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import type { Patient, Treatment } from '@prisma/client'

interface Props {
  patient: Patient & { treatment: Treatment | null }
}

const statusColor: Record<string, string> = {
  ONGOING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  DISCONTINUED: 'bg-red-50 text-red-700',
  ON_HOLD: 'bg-yellow-50 text-yellow-700',
}

export function PatientHeader({ patient }: Props) {
  const age = differenceInYears(new Date(), patient.dateOfBirth)
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h1>
          <p className="text-slate-500 text-sm">{age} years &bull; {patient.gender} &bull; {patient.phone}{patient.email && ` • ${patient.email}`}</p>
          {patient.address && <p className="text-slate-400 text-xs mt-0.5">{patient.address}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {patient.treatment && (
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[patient.treatment.status] || 'bg-slate-100 text-slate-600'}`}>
            {patient.treatment.status.replace('_', ' ')}
          </span>
        )}
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Edit</Button>
        </Link>
      </div>
    </div>
  )
}
