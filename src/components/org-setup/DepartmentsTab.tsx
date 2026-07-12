'use client'

import { useState } from 'react'
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react'
import { createDepartment, updateDepartment } from '@/app/(dashboard)/org-setup/actions'
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

interface DepartmentsTabProps {
  departments: any[]
  employees: any[]
}

export default function DepartmentsTab({ departments, employees }: DepartmentsTabProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedDept, setSelectedDept] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)

  // Create form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editParentId, setEditParentId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')
  const [editHeadId, setEditHeadId] = useState<string | null>(null)

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createDepartment({ name, code, parent_department_id: parentId, description })
      toast.success('Department created successfully!')
      setOpenCreate(false)
      setName('')
      setCode('')
      setParentId(null)
      setDescription('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create department')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (dept: any) => {
    setSelectedDept(dept)
    setEditName(dept.name)
    setEditCode(dept.code)
    setEditParentId(dept.parent_department_id)
    setEditDescription(dept.description || '')
    setEditStatus(dept.status)
    setEditHeadId(dept.head_id)
    setOpenEdit(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDept) return
    setLoading(true)
    try {
      await updateDepartment(selectedDept.id, {
        name: editName,
        code: editCode,
        parent_department_id: editParentId,
        description: editDescription,
        status: editStatus,
        head_id: editHeadId
      })
      toast.success('Department updated successfully!')
      setOpenEdit(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update department')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Departments</h2>
          <p className="text-xs text-muted-foreground">Manage organization hierarchy and assignments</p>
        </div>
        
        {/* Create Dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
          }>
            <Plus className="h-4 w-4" /> Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
              <DialogDescription>Create a new department in the directory hierarchy.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Quality Assurance" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Department Code</Label>
                <Input id="code" value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. QA" maxLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Department</Label>
                <Select value={parentId || 'none'} onValueChange={val => setParentId(val === 'none' ? null : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary of department responsibilities..." />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? 'Creating...' : 'Create Department'}
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
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Head of Dept</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => {
                const head = employees.find(e => e.id === dept.head_id)
                const parent = departments.find(d => d.id === dept.parent_department_id)
                return (
                  <TableRow key={dept.id}>
                    <TableCell className="font-bold text-foreground">{dept.code}</TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{head ? head.full_name : <span className="text-muted-foreground text-xs">Unassigned</span>}</TableCell>
                    <TableCell>{parent ? `${parent.name} (${parent.code})` : <span className="text-muted-foreground text-xs">-</span>}</TableCell>
                    <TableCell>
                      {dept.status === 'active' ? (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(dept)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedDept && (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Modify department details and directory relations.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Department Name</Label>
                <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Department Code</Label>
                <Input id="edit-code" value={editCode} onChange={e => setEditCode(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-head">Department Head</Label>
                <Select value={editHeadId || 'none'} onValueChange={val => setEditHeadId(val === 'none' ? null : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a Head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parent">Parent Department</Label>
                <Select value={editParentId || 'none'} onValueChange={val => setEditParentId(val === 'none' ? null : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root)</SelectItem>
                    {departments
                      .filter(d => d.id !== selectedDept.id) // Avoid choosing itself
                      .map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
