import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function PatientOverviewPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      medicalRecord: true,
      currentProblem: true,
      prescriptions: { include: { medications: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      sessions: { orderBy: { sessionDate: 'desc' }, take: 3 },
      progressLogs: { orderBy: { logDate: 'desc' }, take: 1 },
      treatment: true,
      followUp: true,
      review: true,
    },
  })
  if (!patient) notFound()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Current Problem</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          {patient.currentProblem ? (
            <div className="space-y-1">
              <p className="font-medium text-slate-900">{patient.currentProblem.chiefComplaint}</p>
              <p>Severity: <span className="font-medium text-red-600">{patient.currentProblem.severity}/10</span></p>
              {patient.currentProblem.description && <p>{patient.currentProblem.description}</p>}
            </div>
          ) : <p className="text-slate-400 italic">Not recorded yet</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Latest Progress</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          {patient.progressLogs[0] ? (
            <div className="space-y-1">
              <p>Pain Scale: <span className="font-medium text-red-600">{patient.progressLogs[0].painScale}/10</span></p>
              {patient.progressLogs[0].mobilityScore != null && <p>Mobility: <span className="font-medium text-blue-600">{patient.progressLogs[0].mobilityScore}/10</span></p>}
              <p className="text-xs text-slate-400">{format(patient.progressLogs[0].logDate, 'MMM d, yyyy')}</p>
            </div>
          ) : <p className="text-slate-400 italic">No progress logged</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Sessions</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          {patient.sessions.length === 0 ? <p className="text-slate-400 italic">No sessions yet</p> : (
            <div className="space-y-2">
              {patient.sessions.map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span>{s.sessionType.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 text-xs">{format(s.sessionDate, 'MMM d, yyyy')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Follow-Up</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          {patient.followUp?.nextVisitDate ? (
            <div className="space-y-1">
              <p className="font-semibold text-blue-700">Next Visit: {format(patient.followUp.nextVisitDate, 'MMM d, yyyy')}</p>
              {patient.followUp.precautions && <p className="text-slate-500">{patient.followUp.precautions}</p>}
            </div>
          ) : <p className="text-slate-400 italic">No follow-up scheduled</p>}
        </CardContent>
      </Card>
      {patient.review && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Patient Review</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-600">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < patient.review!.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
              ))}
              <span className="text-xs text-slate-500 ml-1">{['','Poor','Fair','Good','Very Good','Excellent'][patient.review.rating]}</span>
            </div>
            {patient.review.comments && <p className="text-slate-500 italic">&ldquo;{patient.review.comments}&rdquo;</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
