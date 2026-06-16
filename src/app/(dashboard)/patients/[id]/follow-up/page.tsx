'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'

export default function FollowUpPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState({ nextVisitDate: '', homeExercises: '', precautions: '', dietaryAdvice: '', additionalNotes: '' })

  useEffect(() => {
    fetch(`/api/patients/${id}/follow-up`).then(r => r.json()).then(d => {
      if (d) setForm({ nextVisitDate: d.nextVisitDate ? d.nextVisitDate.slice(0, 10) : '', homeExercises: d.homeExercises || '', precautions: d.precautions || '', dietaryAdvice: d.dietaryAdvice || '', additionalNotes: d.additionalNotes || '' })
      setLoaded(true)
    })
  }, [id])

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/patients/${id}/follow-up`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, nextVisitDate: form.nextVisitDate || null }),
    })
    setSaving(false)
    toast({ title: 'Follow-up guidelines saved' })
  }

  if (!loaded) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div className="max-w-xl">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Next Visit Date</Label>
              <Input type="date" value={form.nextVisitDate} onChange={update('nextVisitDate')} />
              {form.nextVisitDate && (
                <p className="text-sm font-medium text-blue-700">Scheduled: {format(parseISO(form.nextVisitDate), 'MMMM d, yyyy')}</p>
              )}
            </div>
            <div className="space-y-2"><Label>Home Exercises</Label><Textarea value={form.homeExercises} onChange={update('homeExercises')} rows={3} placeholder="Exercises to perform at home..." /></div>
            <div className="space-y-2"><Label>Precautions</Label><Textarea value={form.precautions} onChange={update('precautions')} rows={2} placeholder="Activities to avoid, safety guidelines..." /></div>
            <div className="space-y-2"><Label>Dietary Advice</Label><Textarea value={form.dietaryAdvice} onChange={update('dietaryAdvice')} rows={2} placeholder="Dietary recommendations..." /></div>
            <div className="space-y-2"><Label>Additional Notes</Label><Textarea value={form.additionalNotes} onChange={update('additionalNotes')} rows={2} /></div>
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save Follow-Up'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
