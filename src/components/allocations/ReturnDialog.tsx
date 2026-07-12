'use client'

import { useState } from 'react'
import { returnAsset } from '@/app/(dashboard)/allocations/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ReturnDialogProps {
  allocationId: string | null
  onClose: () => void
}

export default function ReturnDialog({ allocationId, onClose }: ReturnDialogProps) {
  const [loading, setLoading] = useState(false)
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'damaged'>('good')
  const [remarks, setRemarks] = useState('')

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allocationId) return
    setLoading(true)
    try {
      await returnAsset(allocationId, {
        return_condition: condition,
        return_remarks: remarks || undefined
      })
      toast.success('Asset returned successfully!')
      onClose()
      setRemarks('')
      setCondition('good')
    } catch (err: any) {
      toast.error(err.message || 'Failed to return asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!allocationId} onOpenChange={(val) => !val && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Asset Check-in</DialogTitle>
          <DialogDescription>
            Record check-in condition and remarks to make this asset available for future allocations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleReturn} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="return-condition">Condition at Return</Label>
            <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
              <SelectTrigger id="return-condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="damaged">Damaged (Forces servicing/maintenance flags)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="return-remarks">Check-in Comments</Label>
            <Textarea id="return-remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Returned with original charging cable, minor cosmetic scratches..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
              {loading ? 'Processing...' : 'Complete Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
