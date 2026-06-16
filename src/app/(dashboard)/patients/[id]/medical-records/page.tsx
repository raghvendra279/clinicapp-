'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function MedicalRecordsPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    pastHistory: '', allergies: '', existingConditions: '', bloodGroup: '', emergencyContact: '',
    chiefComplaint: '', severity: '5', onsetDate: '', description: '', aggravatingFactors: '', relievingFactors: '',
  })

  useEffect(() => {
    fetch(`/api/patients/${id}`).then(r => r.json()).then(p => {
      setForm({
        pastHistory: p.medicalRecord?.pastHistory || '',
        allergies: p.medicalRecord?.allergies || '',
        existingConditions: p.medicalRecord?.existingConditions || '',
        bloodGroup: p.medicalRecord?.bloodGroup || '',
        emergencyContact: p.medicalRecord?.emergencyContact || '',
        chiefComplaint: p.currentProblem?.chiefComplaint || '',
        severity: p.currentProblem?.severity?.toString() || '5',
        onsetDate: p.currentProblem?.onsetDate ? p.currentProblem.onsetDate.slice(0, 10) : '',
        description: p.currentProblem?.description || '',
        aggravatingFactors: p.currentProblem?.aggravatingFactors || '',
        relievingFactors: p.currentProblem?.relievingFactors || '',
      })
      setLoading(false)
    })
  }, [id])

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await Promise.all([
      fetch(`/api/patients/${id}/medical-records`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastHistory: form.pastHistory, allergies: form.allergies, existingConditions: form.existingConditions, bloodGroup: form.bloodGroup, emergencyContact: form.emergencyContact }),
      }),
      fetch(`/api/patients/${id}/current-problem`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chiefComplaint: form.chiefComplaint, severity: parseInt(form.severity) || 5, onsetDate: form.onsetDate || null, description: form.description, aggravatingFactors: form.aggravatingFactors, relievingFactors: form.relievingFactors }),
      }),
    ])
    setSaving(false)
    toast({ title: 'Medical records saved' })
  }

  if (loading) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-base">Medical History</h2>
          <div className="space-y-2"><Label>Past History</Label><Textarea value={form.pastHistory} onChange={update('pastHistory')} rows={2} placeholder="Previous surgeries, chronic illnesses..." /></div>
          <div className="space-y-2"><Label>Allergies</Label><Textarea value={form.allergies} onChange={update('allergies')} rows={2} placeholder="Known drug or food allergies..." /></div>
          <div className="space-y-2"><Label>Existing Conditions</Label><Textarea value={form.existingConditions} onChange={update('existingConditions')} rows={2} placeholder="Diabetes, hypertension, etc." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Blood Group</Label><Input value={form.bloodGroup} onChange={update('bloodGroup')} placeholder="e.g. O+" /></div>
            <div className="space-y-2"><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={update('emergencyContact')} placeholder="Name & phone" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-slate-900 text-base">Current Health Problem</h2>
          <div className="space-y-2"><Label>Chief Complaint *</Label><Input value={form.chiefComplaint} onChange={update('chiefComplaint')} placeholder="Main reason for visit" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Severity (1-10)</Label><Input type="number" min="1" max="10" value={form.severity} onChange={update('severity')} /></div>
            <div className="space-y-2"><Label>Onset Date</Label><Input type="date" value={form.onsetDate} onChange={update('onsetDate')} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={update('description')} rows={2} /></div>
          <div className="space-y-2"><Label>Aggravating Factors</Label><Textarea value={form.aggravatingFactors} onChange={update('aggravatingFactors')} rows={2} /></div>
          <div className="space-y-2"><Label>Relieving Factors</Label><Textarea value={form.relievingFactors} onChange={update('relievingFactors')} rows={2} /></div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={saving}>{saving ? 'Saving...' : 'Save Medical Records'}</Button>
    </form>
  )
}
