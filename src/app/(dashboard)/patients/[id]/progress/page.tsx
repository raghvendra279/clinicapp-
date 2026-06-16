'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ProgressLog { id: string; logDate: string; painScale: number; mobilityScore: number | null; exercisesDone: string; notes: string }

export default function ProgressPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ logDate: new Date().toISOString().slice(0, 10), painScale: '5', mobilityScore: '', exercisesDone: '', notes: '' })

  useEffect(() => {
    fetch(`/api/patients/${id}/progress`).then(r => r.json()).then(d => { setLogs(d); setLoading(false) })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/patients/${id}/progress`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, painScale: parseInt(form.painScale), mobilityScore: form.mobilityScore ? parseInt(form.mobilityScore) : null }),
    })
    if (res.ok) { const log = await res.json(); setLogs([log, ...logs]); setShowForm(false); toast({ title: 'Progress logged' }) }
    setSaving(false)
  }

  const chartData = [...logs].reverse().map(l => ({
    date: format(new Date(l.logDate), 'MMM d'),
    'Pain Scale': l.painScale,
    'Mobility': l.mobilityScore,
  }))

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-900">Daily Progress ({logs.length} entries)</h2>
        <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />Log Progress
        </Button>
      </div>

      {logs.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 mb-3 font-medium">Progress Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Pain Scale" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Mobility" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.logDate} onChange={e => setForm({ ...form, logDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Pain Scale (0-10)</Label><Input type="number" min="0" max="10" value={form.painScale} onChange={e => setForm({ ...form, painScale: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Mobility (0-10)</Label><Input type="number" min="0" max="10" value={form.mobilityScore} onChange={e => setForm({ ...form, mobilityScore: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Exercises Done</Label><Input value={form.exercisesDone} onChange={e => setForm({ ...form, exercisesDone: e.target.value })} placeholder="e.g. Shoulder rotations, walking 20 mins" /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 ? <p className="text-slate-400 text-sm italic">No progress logged yet.</p> : (
        <div className="space-y-2">
          {logs.map(l => (
            <Card key={l.id}>
              <CardContent className="py-3 flex items-start justify-between">
                <div className="text-sm space-y-1">
                  <div className="flex gap-4">
                    <span className="font-medium text-red-600">Pain: {l.painScale}/10</span>
                    {l.mobilityScore != null && <span className="font-medium text-blue-600">Mobility: {l.mobilityScore}/10</span>}
                  </div>
                  {l.exercisesDone && <p className="text-slate-600 text-xs">{l.exercisesDone}</p>}
                  {l.notes && <p className="text-slate-500 text-xs italic">{l.notes}</p>}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{format(new Date(l.logDate), 'MMM d, yyyy')}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
