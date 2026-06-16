'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Star } from 'lucide-react'

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comments, setComments] = useState('')

  useEffect(() => {
    fetch(`/api/patients/${id}/review`).then(r => r.json()).then(d => {
      if (d) { setRating(d.rating || 0); setComments(d.comments || '') }
      setLoaded(true)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/patients/${id}/review`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comments }),
    })
    setSaving(false)
    toast({ title: 'Review saved' })
  }

  if (!loaded) return <div className="text-slate-400 text-sm p-4">Loading...</div>

  return (
    <div className="max-w-md">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Patient Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110">
                    <Star className={`w-9 h-9 transition-colors ${n <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <p className="text-sm font-medium text-slate-700">{RATING_LABELS[hovered || rating]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Patient Feedback</Label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} rows={5} placeholder="Patient's comments about their treatment and experience..." />
            </div>
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={saving || rating === 0}>
              {saving ? 'Saving...' : 'Save Review'}
            </Button>
            {rating === 0 && <p className="text-xs text-slate-400 text-center">Please select a star rating first</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
