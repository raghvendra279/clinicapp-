import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { differenceInYears, format } from 'date-fns'

export default async function PatientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || ''
  const patients = await prisma.patient.findMany({
    where: q ? { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { lastName: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }] } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { treatment: true },
  })

  const statusColor: Record<string, string> = {
    ONGOING: 'bg-blue-50 text-blue-700',
    COMPLETED: 'bg-green-50 text-green-700',
    DISCONTINUED: 'bg-red-50 text-red-700',
    ON_HOLD: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm">{patients.length} patient{patients.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link href="/patients/new">
          <Button className="bg-blue-700 hover:bg-blue-800"><Plus className="w-4 h-4 mr-2" />New Patient</Button>
        </Link>
      </div>
      <form method="GET" className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="Search by name or phone..." className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>
      <div className="space-y-2">
        {patients.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No patients found. <Link href="/patients/new" className="text-blue-700 underline">Add the first patient.</Link></CardContent></Card>
        ) : (
          patients.map((p) => {
            const age = differenceInYears(new Date(), p.dateOfBirth)
            return (
              <Link key={p.id} href={`/patients/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                        <p className="text-sm text-slate-500">{age} yrs &bull; {p.gender} &bull; {p.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.treatment ? (statusColor[p.treatment.status] || 'bg-slate-100 text-slate-600') : 'bg-slate-100 text-slate-600'}`}>
                        {p.treatment?.status?.replace('_', ' ') || 'No Treatment'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Added {format(p.createdAt, 'MMM d, yyyy')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
