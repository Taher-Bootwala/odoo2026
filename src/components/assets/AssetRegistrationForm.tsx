'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createAsset } from '@/app/(dashboard)/assets/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AssetRegistrationFormProps {
  categories: any[]
  departments: any[]
}

export default function AssetRegistrationForm({ categories, departments }: AssetRegistrationFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fields
  const [name, setName] = useState('')
  const [serial, setSerial] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'damaged'>('good')
  const [location, setLocation] = useState('')
  const [deptId, setDeptId] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)
  const [resourceType, setResourceType] = useState<'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle' | null>(null)
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      toast.error('Please select an asset category')
      return
    }

    setLoading(true)
    try {
      await createAsset({
        name,
        serial_number: serial || undefined,
        category_id: categoryId,
        purchase_date: purchaseDate || undefined,
        purchase_cost: purchaseCost ? Number(purchaseCost) : undefined,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        condition,
        location: location || undefined,
        department_id: deptId || null,
        is_shared_resource: isShared,
        resource_type: isShared ? resourceType : null,
        description: description || undefined
      })
      
      toast.success('Physical asset registered successfully!')
      setOpen(false)
      
      // Reset form
      setName('')
      setSerial('')
      setCategoryId('')
      setPurchaseDate('')
      setPurchaseCost('')
      setManufacturer('')
      setModel('')
      setCondition('good')
      setLocation('')
      setDeptId(null)
      setIsShared(false)
      setResourceType(null)
      setDescription('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to register asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
      }>
        <Plus className="h-4 w-4" /> Register Asset
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Physical Asset</DialogTitle>
          <DialogDescription>
            Add a new inventory asset item to organization lifecycle tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input id="asset-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. MacBook Pro M3 Max" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-category">Category</Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                <SelectTrigger id="asset-category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-serial">Serial Number / Asset Tag</Label>
              <Input id="asset-serial" value={serial} onChange={e => setSerial(e.target.value)} placeholder="e.g. C02X81..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-manufacturer">Manufacturer</Label>
              <Input id="asset-manufacturer" value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="e.g. Apple" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-model">Model</Label>
              <Input id="asset-model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. A2991" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-date">Purchase Date</Label>
              <Input id="asset-date" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-cost">Acquisition Cost (USD)</Label>
              <Input id="asset-cost" type="number" min={0} value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} placeholder="e.g. 2499.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-condition">Condition</Label>
              <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                <SelectTrigger id="asset-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-location">Location / Shelf Room</Label>
              <Input id="asset-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Room 402, Shelf C" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset-dept">Assign Department</Label>
              <Select value={deptId || 'none'} onValueChange={val => setDeptId(val === 'none' ? null : val)}>
                <SelectTrigger id="asset-dept">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="asset-is-shared" checked={isShared} onCheckedChange={(val: boolean) => setIsShared(val)} />
              <Label htmlFor="asset-is-shared" className="cursor-pointer font-medium">Bookable Shared Resource</Label>
            </div>

            {isShared && (
              <div className="space-y-2">
                <Label htmlFor="asset-resource-type">Shared Resource Type</Label>
                <Select value={resourceType || 'none'} onValueChange={(val: any) => setResourceType(val === 'none' ? null : val)}>
                  <SelectTrigger id="asset-resource-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting_room">Meeting Room</SelectItem>
                    <SelectItem value="conference_hall">Conference Hall</SelectItem>
                    <SelectItem value="projector">Projector</SelectItem>
                    <SelectItem value="company_vehicle">Company Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="asset-description">Notes & Technical Info</Label>
              <Textarea id="asset-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Warranty details, special handling instructions..." />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
              {loading ? 'Registering...' : 'Register Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
