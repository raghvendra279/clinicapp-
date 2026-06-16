'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname()
  const base = `/patients/${patientId}`
  const tabs = [
    { href: base, label: 'Overview' },
    { href: `${base}/medical-records`, label: 'Medical Records' },
    { href: `${base}/prescriptions`, label: 'Prescriptions' },
    { href: `${base}/sessions`, label: 'Sessions' },
    { href: `${base}/progress`, label: 'Progress' },
    { href: `${base}/treatment`, label: 'Treatment' },
    { href: `${base}/follow-up`, label: 'Follow-Up' },
    { href: `${base}/review`, label: 'Review' },
  ]
  return (
    <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1 overflow-x-auto">
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== base && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className={cn('px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors', active ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50')}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
