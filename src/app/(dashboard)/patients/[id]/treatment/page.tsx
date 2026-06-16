'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function TreatmentPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState({ status: 'ONGOING', startDate: new Date().toISOString().slice(0, 10), endDate: '', summary: '', outcome: '' })

  useEffect(() => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then(p => {
      if (p.treatment) setForm({ status: p.treatment.status, startDate: p.treatment.startDate.slice(0, 10), endDate: p.treatment.endDate ? p.treatment.endDate.slice(0, 10) : '', summary: p.treatment.summary || '', outcome: p.treatment.outcome || '' })
      setLoaded(true)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/patients/${id}/treatment`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, endDate: form.endDate || null }),
    })
    setSaving(false)
    toast({ title: 'Treatment status saved' })
  }

  if (!loaded) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  const statusColors: Record<string, string> = {
    ONGOING: 'text-blue-700', COMPLETED: 'text-green-700', ON_HOLD: 'text-yellow-700', DISCONTINUED: 'text-red-700'
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Treatment Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ON_HOLD">ON HOLD</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
              </select>
              <p className={`text-xs font-medium ${statusColors[form.status]}`}>Current: {form.status.replace('_', ' ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Treatment Summary</Label><Textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="Summary of treatment provided..." /></div>
            <div className="space-y-2"><Label>Outcome</Label><Textarea value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} rows={2} placeholder="Patient outcome and recovery status..." /></div>
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save Treatment'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
