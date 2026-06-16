'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Med { name: string; dosage: string; frequency: string; duration: string; instructions: string }
interface Prescription { id: string; dateIssued: string; notes: string; medications: (Med & { id: string })[] }

const blankMed = (): Med => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })

export default function PrescriptionsPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [notes, setNotes] = useState('')
  const [meds, setMeds] = useState<Med[]>([blankMed()])

  useEffect(() => {
    fetch(`/api/patients/${id}/prescriptions`).then(r => r.json()).then(d => { setPrescriptions(d); setLoading(false) })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/patients/${id}/prescriptions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, medications: meds }),
    })
    if (res.ok) {
      const newP = await res.json()
      setPrescriptions([newP, ...prescriptions])
      setShowForm(false); setNotes(''); setMeds([blankMed()])
      toast({ title: 'Prescription added' })
    }
    setSaving(false)
  }

  const updateMed = (i: number, k: keyof Med) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = [...meds]; m[i] = { ...m[i], [k]: e.target.value }; setMeds(m)
  }

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-900">Prescriptions ({prescriptions.length})</h2>
        <Button size="sm" className="bg-blue-700 hover:bg-blue-800" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />Add Prescription
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-slate-700">Medications</h3>
                {meds.map((med, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Medicine name *" value={med.name} onChange={updateMed(i, 'name')} required className="flex-1" />
                      <Input placeholder="Dosage" value={med.dosage} onChange={updateMed(i, 'dosage')} className="w-28" />
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Frequency" value={med.frequency} onChange={updateMed(i, 'frequency')} className="flex-1" />
                      <Input placeholder="Duration" value={med.duration} onChange={updateMed(i, 'duration')} className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Instructions" value={med.instructions} onChange={updateMed(i, 'instructions')} className="flex-1" />
                      {meds.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setMeds(meds.filter((_, j) => j !== i))}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setMeds([...meds, blankMed()])}>
                  <Plus className="w-4 h-4 mr-1" />Add Medicine
                </Button>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save Prescription'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {prescriptions.length === 0 && !showForm ? <p className="text-slate-400 text-sm italic">No prescriptions yet.</p> : (
        prescriptions.map(p => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{format(new Date(p.dateIssued), 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {p.medications.map(m => (
                <div key={m.id} className="text-sm bg-blue-50 rounded-md p-2.5">
                  <span className="font-semibold text-blue-900">{m.name}</span>
                  {m.dosage && <span className="text-blue-700"> &mdash; {m.dosage}</span>}
                  {m.frequency && <span className="text-slate-600"> &bull; {m.frequency}</span>}
                  {m.duration && <span className="text-slate-500"> for {m.duration}</span>}
                  {m.instructions && <p className="text-slate-500 text-xs mt-0.5 italic">{m.instructions}</p>}
                </div>
              ))}
              {p.notes && <p className="text-sm text-slate-500 mt-2">{p.notes}</p>}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
