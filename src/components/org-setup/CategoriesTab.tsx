'use client'

import { useState } from 'react'
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import { createCategory, updateCategory } from '@/app/(dashboard)/org-setup/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface CategoriesTabProps {
  categories: any[]
}

export default function CategoriesTab({ categories }: CategoriesTabProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedCat, setSelectedCat] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)

  // Create form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [warranty, setWarranty] = useState<number>(12)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editWarranty, setEditWarranty] = useState<number>(12)
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createCategory({ name, description, warranty_period_months: Number(warranty) })
      toast.success('Asset category created successfully!')
      setOpenCreate(false)
      setName('')
      setDescription('')
      setWarranty(12)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (cat: any) => {
    setSelectedCat(cat)
    setEditName(cat.name)
    setEditDescription(cat.description || '')
    setEditWarranty(cat.warranty_period_months || 0)
    setEditStatus(cat.status)
    setOpenEdit(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCat) return
    setLoading(true)
    try {
      await updateCategory(selectedCat.id, {
        name: editName,
        description: editDescription,
        warranty_period_months: Number(editWarranty),
        status: editStatus
      })
      toast.success('Asset category updated successfully!')
      setOpenEdit(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Asset Categories</h2>
          <p className="text-xs text-muted-foreground">Manage asset classifications and metadata rules</p>
        </div>
        
        {/* Create Dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
          }>
            <Plus className="h-4 w-4" /> Add Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Asset Category</DialogTitle>
              <DialogDescription>Create a new category for physical asset classification.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Laptops, Vehicles, Office Chairs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Default Warranty (months)</Label>
                <Input id="warranty" type="number" min={0} value={warranty} onChange={e => setWarranty(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What kinds of assets fall under this category..." />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Directory Table */}
      <div className="border border-border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Default Warranty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-semibold text-foreground">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{cat.description || '-'}</TableCell>
                  <TableCell>{cat.warranty_period_months ? `${cat.warranty_period_months} months` : '-'}</TableCell>
                  <TableCell>
                    {cat.status === 'active' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 gap-1">
                        <XCircle className="h-3 w-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(cat)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedCat && (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Modify default rules and properties for the category.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-warranty">Default Warranty (months)</Label>
                <Input id="edit-warranty" type="number" min={0} value={editWarranty} onChange={e => setEditWarranty(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
