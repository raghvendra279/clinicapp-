'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface SessionItem { id: string; sessionDate: string; sessionType: string; durationMins: number; therapistNotes: string }

const SESSION_TYPES = ['INITIAL_ASSESSMENT','EXERCISE_THERAPY','MANUAL_THERAPY','ELECTROTHERAPY','HYDROTHERAPY','TAPING','REVIEW','DISCHARGE']

export default function SessionsPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionType: 'EXERCISE_THERAPY',
    durationMins: '45',
    therapistNotes: '',
  })

  useEffect(() => {
    fetch(`/api/patients/${id}/sessions`).then(r => r.json()).then(d => { setSessions(d); setLoading(false) })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/patients/${id}/sessions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, durationMins: parseInt(form.durationMins) }),
    })
    if (res.ok) { const s = await res.json(); setSessions([s, ...sessions]); setShowForm(false); toast({ title: 'Session logged' }) }
    setSaving(false)
  }

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-900">Sessions ({sessions.length})</h2>
        <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />Log Session
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.sessionDate} onChange={e => setForm({ ...form, sessionDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Duration (mins)</Label><Input type="number" value={form.durationMins} onChange={e => setForm({ ...form, durationMins: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Session Type</Label>
                <select value={form.sessionType} onChange={e => setForm({ ...form, sessionType: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Therapist Notes</Label><Textarea value={form.therapistNotes} onChange={e => setForm({ ...form, therapistNotes: e.target.value })} rows={3} /></div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save Session'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? <p className="text-slate-400 text-sm italic">No sessions logged yet.</p> : (
        sessions.map(s => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{s.sessionType.replace(/_/g, ' ')}</CardTitle>
                <div className="text-xs text-slate-400">{format(new Date(s.sessionDate), 'MMM d, yyyy')} &bull; {s.durationMins} mins</div>
              </div>
            </CardHeader>
            {s.therapistNotes && <CardContent className="pt-0 text-sm text-slate-600">{s.therapistNotes}</CardContent>}
          </Card>
        ))
      )}
    </div>
  )
}
