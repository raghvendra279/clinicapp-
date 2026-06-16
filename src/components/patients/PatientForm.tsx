'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface PatientFormProps {
  defaultValues?: {
    id?: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    gender?: string
    phone?: string
    email?: string
    address?: string
  }
}

export function PatientForm({ defaultValues }: PatientFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = !!defaultValues?.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const data = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      dateOfBirth: fd.get('dateOfBirth'),
      gender: fd.get('gender'),
      phone: fd.get('phone'),
      email: fd.get('email') || null,
      address: fd.get('address') || null,
    }
    const res = await fetch(isEdit ? `/api/patients/${defaultValues.id}` : '/api/patients', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (res.ok) {
      const patient = await res.json()
      toast({ title: isEdit ? 'Patient updated' : 'Patient created' })
      router.push(`/patients/${isEdit ? defaultValues.id : patient.id}`)
      router.refresh()
    } else {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" defaultValue={defaultValues?.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" defaultValue={defaultValues?.lastName} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={defaultValues?.dateOfBirth} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select id="gender" name="gender" defaultValue={defaultValues?.gender || ''} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" defaultValue={defaultValues?.phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={defaultValues?.email || ''} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={defaultValues?.address || ''} rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
