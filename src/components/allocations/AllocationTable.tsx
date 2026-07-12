'use client'

import { useState, useMemo } from 'react'
import { Plus, HelpCircle, AlertOctagon, UserMinus, ArrowLeftRight, Search } from 'lucide-react'
import { allocateAsset } from '@/app/(dashboard)/allocations/actions'
import { createTransferRequest } from '@/app/(dashboard)/transfers/actions'
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
import { getStatusColor, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import ReturnDialog from './ReturnDialog'

interface AllocationTableProps {
  initialAllocations: any[]
  assets: any[]
  employees: any[]
  userRole: string
}

export default function AllocationTable({ initialAllocations, assets, employees, userRole }: AllocationTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [loading, setLoading] = useState(false)

  // Checkout Fields
  const [assetId, setAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [purpose, setPurpose] = useState('')

  // Conflict state
  const [conflictData, setConflictData] = useState<{ assetId: string; holderName: string } | null>(null)
  const [openConflict, setOpenConflict] = useState(false)

  // Return dialog trigger
  const [returnAllocationId, setReturnAllocationId] = useState<string | null>(null)

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'asset_manager'

  // Submit allocation checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetId || !employeeId) {
      toast.error('Asset and Employee fields are required')
      return
    }

    setLoading(true)
    try {
      await allocateAsset({
        asset_id: assetId,
        employee_id: employeeId,
        expected_return_date: returnDate || undefined,
        purpose: purpose || undefined
      })
      toast.success('Asset check-out processed successfully!')
      setOpenCreate(false)
      
      // Reset
      setAssetId('')
      setEmployeeId('')
      setReturnDate('')
      setPurpose('')
    } catch (err: any) {
      const errMsg = err.message || ''
      if (errMsg.includes('CONFLICT:')) {
        const holderName = errMsg.split('CONFLICT: Currently held by ')[1] || 'another user'
        setConflictData({ assetId, holderName })
        setOpenConflict(true)
        setOpenCreate(false) // Close main allocation modal
      } else {
        toast.error(errMsg || 'Failed to checkout asset')
      }
    } finally {
      setLoading(false)
    }
  }

  // Submit Transfer request directly from conflict modal
  const handleTransferRequest = async () => {
    if (!conflictData || !employeeId) return
    setLoading(true)
    try {
      await createTransferRequest({
        asset_id: conflictData.assetId,
        to_employee_id: employeeId,
        reason: `Automated request during checkout conflict. Requested by manager/admin.`
      })
      toast.success('Transfer request raised successfully for current holder!')
      setOpenConflict(false)
      setConflictData(null)
      setAssetId('')
      setEmployeeId('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to request transfer')
    } finally {
      setLoading(false)
    }
  }

  // Filtered allocations for search
  const filteredAllocations = useMemo(() => {
    return initialAllocations.filter(alloc => {
      const search = globalFilter.toLowerCase()
      const assetName = String(alloc.assets?.name || '').toLowerCase()
      const assetTag = String(alloc.assets?.asset_id || '').toLowerCase()
      const employeeName = String(alloc.users?.full_name || '').toLowerCase()
      return assetName.includes(search) || assetTag.includes(search) || employeeName.includes(search)
    })
  }, [initialAllocations, globalFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Asset Allocations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage physical asset check-outs and check-ins for organizational directory staff.
          </p>
        </div>

        {isManagerOrAdmin && (
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
            }>
              <Plus className="h-4 w-4" /> Check-out Asset
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check-out Asset</DialogTitle>
                <DialogDescription>
                  Allocate an available asset item to an active directory employee.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-asset">Select Asset</Label>
                  <Select value={assetId} onValueChange={(val) => setAssetId(val || '')}>
                    <SelectTrigger id="checkout-asset">
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-emp">Assign Employee</Label>
                  <Select value={employeeId} onValueChange={(val) => setEmployeeId(val || '')}>
                    <SelectTrigger id="checkout-emp">
                      <SelectValue placeholder="Select recipient staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-date">Expected Return Date (Optional)</Label>
                  <Input id="checkout-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-purpose">Allocation Purpose</Label>
                  <Textarea id="checkout-purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Software engineering project development work..." />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                    {loading ? 'Processing...' : 'Complete Checkout'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          value={globalFilter} 
          onChange={e => setGlobalFilter(e.target.value)} 
          placeholder="Filter by asset name, tag, employee name..." 
          className="pl-9 w-full"
        />
      </div>

      {/* Allocations Directory Table */}
      <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Recipient Holder</TableHead>
              <TableHead>Allocated Date</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAllocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground text-sm">
                  No allocation transaction records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAllocations.map((alloc) => (
                <TableRow key={alloc.id}>
                  <TableCell className="font-bold text-foreground">{alloc.assets?.asset_id}</TableCell>
                  <TableCell className="font-semibold text-foreground">{alloc.assets?.name}</TableCell>
                  <TableCell className="font-medium">{alloc.users?.full_name}</TableCell>
                  <TableCell>{formatDate(alloc.allocated_at)}</TableCell>
                  <TableCell>{alloc.expected_return_date ? formatDate(alloc.expected_return_date) : <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(alloc.status)}>
                      {alloc.status === 'active' ? 'Active' : 'Returned'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isManagerOrAdmin && alloc.status === 'active' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Return Asset" onClick={() => setReturnAllocationId(alloc.id)}>
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Return Dialog UI Component */}
      <ReturnDialog 
        allocationId={returnAllocationId} 
        onClose={() => setReturnAllocationId(null)} 
      />

      {/* Conflict Modal UX */}
      {conflictData && (
        <Dialog open={openConflict} onOpenChange={setOpenConflict}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-2 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <DialogTitle className="text-lg font-bold">Asset Allocation Conflict</DialogTitle>
              <DialogDescription className="text-xs">
                This asset item is currently checked out to another employee.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-secondary/20 rounded-lg text-center space-y-1 text-sm border border-border">
              <span className="font-semibold block">Current Holder:</span>
              <span className="font-bold text-primary">{conflictData.holderName}</span>
            </div>
            <div className="text-xs text-muted-foreground text-center leading-normal">
              Would you like to raise an automated transfer request to acquire this asset item from the current holder?
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={() => {
                setOpenConflict(false)
                setConflictData(null)
              }} className="border-border w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleTransferRequest} disabled={loading} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto gap-1">
                <ArrowLeftRight className="h-4 w-4" /> Request Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
