import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalPatients, activePatients, completedPatients, todaySessions, recentPatients] = await Promise.all([
    prisma.patient.count(),
    prisma.treatment.count({ where: { status: 'ONGOING' } }),
    prisma.treatment.count({ where: { status: 'COMPLETED' } }),
    prisma.session.count({ where: { sessionDate: { gte: today, lt: tomorrow } } }),
    prisma.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { treatment: true } }),
  ])

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users, color: 'text-blue-700' },
    { label: 'Active Cases', value: activePatients, icon: Activity, color: 'text-green-600' },
    { label: 'Completed', value: completedPatients, icon: CheckCircle, color: 'text-slate-600' },
    { label: "Today's Sessions", value: todaySessions, icon: Calendar, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Welcome back, {session.user?.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Patients</CardTitle></CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <p className="text-slate-500 text-sm">No patients yet. <Link href="/patients/new" className="text-blue-700 underline">Add one.</Link></p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPatients.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-500">{p.phone} &bull; Added {format(p.createdAt, 'MMM d, yyyy')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.treatment?.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : p.treatment?.status === 'ONGOING' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.treatment?.status || 'No Treatment'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
