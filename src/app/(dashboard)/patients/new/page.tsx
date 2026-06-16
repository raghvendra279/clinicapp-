import { PatientForm } from '@/components/patients/PatientForm'

export default function NewPatientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Patient</h1>
        <p className="text-slate-500 text-sm">Fill in the patient details below</p>
      </div>
      <PatientForm />
    </div>
  )
}
