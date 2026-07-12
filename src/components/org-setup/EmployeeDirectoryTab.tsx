'use client'

import { useState, useMemo } from 'react'
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { Edit2, ShieldAlert, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { updateEmployeeRoleOrStatus } from '@/app/(dashboard)/org-setup/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getRoleColor, formatRole, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface EmployeeDirectoryTabProps {
  employees: any[]
  departments: any[]
}

export default function EmployeeDirectoryTab({ employees, departments }: EmployeeDirectoryTabProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  // Edit fields
  const [editRole, setEditRole] = useState<'admin' | 'asset_manager' | 'department_head' | 'employee'>('employee')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')
  const [editDeptId, setEditDeptId] = useState<string | null>(null)

  const handleEditClick = (employee: any) => {
    setSelectedEmp(employee)
    setEditRole(employee.role)
    setEditStatus(employee.status)
    setEditDeptId(employee.department_id)
    setOpenEdit(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp) return
    setLoading(true)
    try {
      await updateEmployeeRoleOrStatus(selectedEmp.id, {
        role: editRole,
        status: editStatus,
        department_id: editDeptId
      })
      toast.success('Employee credentials updated!')
      setOpenEdit(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update employee')
    } finally {
      setLoading(false)
    }
  }

  // TanStack Table Column Definition
  const columnHelper = createColumnHelper<any>()
  const columns = useMemo(() => [
    columnHelper.accessor('employee_id', {
      header: 'ID',
      cell: info => <span className="font-bold text-foreground">{info.getValue() || 'N/A'}</span>,
    }),
    columnHelper.accessor('full_name', {
      header: 'Full Name',
      cell: info => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('department_id', {
      header: 'Department',
      cell: info => {
        const dept = departments.find(d => d.id === info.getValue())
        return dept ? `${dept.name} (${dept.code})` : <span className="text-muted-foreground text-xs">Unassigned</span>
      }
    }),
    columnHelper.accessor('role', {
      header: 'System Role',
      cell: info => (
        <Badge variant="outline" className={getRoleColor(info.getValue())}>
          {formatRole(info.getValue())}
        </Badge>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <Badge variant={info.getValue() === 'active' ? 'secondary' : 'outline'} className={info.getValue() === 'active' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : 'bg-gray-50 text-gray-400 hover:bg-gray-50'}>
          {info.getValue() === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    }),
    columnHelper.accessor('joining_date', {
      header: 'Joining Date',
      cell: info => formatDate(info.getValue())
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEditClick(props.row.original)}>
          <Edit2 className="h-4 w-4" />
        </Button>
      )
    })
  ], [departments])

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase()
      const name = String(row.getValue('full_name') || '').toLowerCase()
      const email = String(row.getValue('email') || '').toLowerCase()
      const empId = String(row.getValue('employee_id') || '').toLowerCase()
      return name.includes(searchValue) || email.includes(searchValue) || empId.includes(searchValue)
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold">Employee Directory</h2>
          <p className="text-xs text-muted-foreground">Manage organization staff directory and elevate roles</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={globalFilter} 
            onChange={e => setGlobalFilter(e.target.value)} 
            placeholder="Search name, email, employee ID..." 
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="border border-border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                  No employees found matching search filter.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-2">
        <div className="text-xs text-muted-foreground">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-border"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="h-8 border-border"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Role Dialog */}
      {selectedEmp && (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Modify Employee Role & Status
              </DialogTitle>
              <DialogDescription>
                Assign system permission scope for <span className="font-semibold text-foreground">{selectedEmp.full_name}</span>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-emp-role">System Role</Label>
                <Select value={editRole} onValueChange={(val: any) => setEditRole(val)}>
                  <SelectTrigger id="edit-emp-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee (Standard signup)</SelectItem>
                    <SelectItem value="department_head">Department Head</SelectItem>
                    <SelectItem value="asset_manager">Asset Manager</SelectItem>
                    <SelectItem value="admin">System Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-emp-dept">Assign Department</Label>
                <Select value={editDeptId || 'none'} onValueChange={val => setEditDeptId(val === 'none' ? null : val)}>
                  <SelectTrigger id="edit-emp-dept">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-emp-status">User Status</Label>
                <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                  <SelectTrigger id="edit-emp-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Access allowed)</SelectItem>
                    <SelectItem value="inactive">Inactive (Deactivated profile)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? 'Saving...' : 'Apply Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
