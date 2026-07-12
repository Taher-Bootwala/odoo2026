'use client'

import { useState } from 'react'
import { Plus, CheckSquare, Wrench, ShieldAlert, AlertTriangle, Hammer, CheckCircle2 } from 'lucide-react'
import { createMaintenanceRequest, approveAndAssignRequest, resolveRequest } from '@/app/(dashboard)/maintenance/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
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
import { formatStatus, formatDate, getStatusColor } from '@/lib/utils'

interface MaintenanceBoardProps {
  initialRequests: any[]
  assets: any[]
  userRole: string
  userId: string
}

export default function MaintenanceBoard({ initialRequests, assets, userRole, userId }: MaintenanceBoardProps) {
  const [openCreate, setOpenCreate] = useState(false)
  const [openAssign, setOpenAssign] = useState(false)
  const [openResolve, setOpenResolve] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Selected Request
  const [activeRequest, setActiveRequest] = useState<any | null>(null)

  // Raise Request Fields
  const [assetId, setAssetId] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [description, setDescription] = useState('')

  // Assign fields
  const [technician, setTechnician] = useState('')

  // Resolve fields
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [cost, setCost] = useState('')

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'asset_manager'

  // Submit Raise Request
  const handleRaiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetId || !description) {
      toast.error('Asset and issue description fields are required')
      return
    }

    setLoading(true)
    try {
      await createMaintenanceRequest({ asset_id: assetId, priority, issue_description: description })
      toast.success('Maintenance ticket raised successfully!')
      setOpenCreate(false)
      
      // Reset
      setAssetId('')
      setPriority('medium')
      setDescription('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to raise ticket')
    } finally {
      setLoading(false)
    }
  }

  // Submit Assign Form
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest || !technician) return
    setLoading(true)
    try {
      await approveAndAssignRequest(activeRequest.id, { technician })
      toast.success('Technician assigned! Asset marked as Under Maintenance.')
      setOpenAssign(false)
      setActiveRequest(null)
      setTechnician('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign technician')
    } finally {
      setLoading(false)
    }
  }

  // Submit Resolve Form
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest || !resolutionNotes) return
    setLoading(true)
    try {
      await resolveRequest(activeRequest.id, {
        resolution_notes: resolutionNotes,
        cost: cost ? Number(cost) : 0
      })
      toast.success('Maintenance resolved! Asset marked back as Available.')
      setOpenResolve(false)
      setActiveRequest(null)
      setResolutionNotes('')
      setCost('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve request')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClick = (req: any) => {
    setActiveRequest(req)
    setOpenAssign(true)
  }

  const handleResolveClick = (req: any) => {
    setActiveRequest(req)
    setOpenResolve(true)
  }

  // Priority styling mapper
  const getPriorityColor = (p: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-100 text-slate-700 border-slate-200',
      medium: 'bg-blue-50 text-blue-700 border-blue-200',
      high: 'bg-amber-50 text-amber-700 border-amber-200',
      critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20'
    }
    return colors[p] || 'bg-slate-100 text-slate-700'
  }

  // Column grouping
  const pendingRequests = initialRequests.filter(r => r.status === 'pending')
  const activeRequests = initialRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'approved')
  const resolvedRequests = initialRequests.filter(r => r.status === 'resolved' || r.status === 'closed')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Maintenance Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track structural maintenance, technician service assignments, and repair details.
          </p>
        </div>

        {/* Raise ticket dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
          }>
            <Plus className="h-4 w-4" /> Raise Ticket
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise Maintenance Ticket</DialogTitle>
              <DialogDescription>
                Submit an issue request for a physical asset. Tickets require Manager approvals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRaiseSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="req-asset">Select Asset</Label>
                <Select value={assetId} onValueChange={(val) => setAssetId(val || '')}>
                  <SelectTrigger id="req-asset">
                    <SelectValue placeholder="Choose asset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name} ({a.asset_id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-priority">Priority Level</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger id="req-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Cosmetic, non-blocking)</SelectItem>
                    <SelectItem value="medium">Medium (Partial performance degradation)</SelectItem>
                    <SelectItem value="high">High (Blocked functionality)</SelectItem>
                    <SelectItem value="critical">Critical (Catastrophic fail, immediate action)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-desc">Issue Description</Label>
                <Textarea id="req-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide descriptive detail about the issue..." required />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  {loading ? 'Submitting...' : 'Raise Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Board workflow columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Pending Approvals
            </h2>
            <Badge variant="secondary" className="bg-amber-50 text-amber-700">{pendingRequests.length}</Badge>
          </div>

          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  No pending maintenance tickets.
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((r) => (
                <Card key={r.id} className="border-border shadow-sm">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-bold text-foreground truncate max-w-[150px]">
                        {r.assets?.name}
                      </CardTitle>
                      <Badge variant="outline" className={getPriorityColor(r.priority)}>
                        {r.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px]">
                      Tag: {r.assets?.asset_id} | Reported: {formatDate(r.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3 text-xs text-muted-foreground leading-relaxed">
                    <p className="font-medium text-foreground bg-slate-50 p-2 rounded">
                      "{r.issue_description}"
                    </p>
                    <p className="text-[10px] text-muted-foreground flex justify-between">
                      <span>Reported By: {r.users?.full_name}</span>
                    </p>

                    {isManagerOrAdmin && (
                      <Button size="sm" onClick={() => handleAssignClick(r)} className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-8 gap-1">
                        <Wrench className="h-3.5 w-3.5" /> Approve & Assign
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Assigned / In Progress Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Under Maintenance
            </h2>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">{activeRequests.length}</Badge>
          </div>

          <div className="space-y-3">
            {activeRequests.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  No assets currently under repair.
                </CardContent>
              </Card>
            ) : (
              activeRequests.map((r) => (
                <Card key={r.id} className="border-border shadow-sm">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-bold text-foreground">
                        {r.assets?.name}
                      </CardTitle>
                      <Badge variant="outline" className={getPriorityColor(r.priority)}>
                        {r.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-[10px]">
                      Tag: {r.assets?.asset_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground bg-slate-50 p-2 rounded leading-relaxed">
                      "{r.issue_description}"
                    </p>
                    <div className="p-2 bg-blue-50/50 text-blue-800 rounded border border-blue-200/50 flex flex-col gap-0.5">
                      <span>Technician Assigned: <span className="font-bold">{r.technician || 'N/A'}</span></span>
                    </div>

                    {isManagerOrAdmin && (
                      <Button size="sm" onClick={() => handleResolveClick(r)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1">
                        <CheckSquare className="h-3.5 w-3.5" /> Resolve Repair
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Resolved Logs
            </h2>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{resolvedRequests.length}</Badge>
          </div>

          <div className="space-y-3">
            {resolvedRequests.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  No resolved log entries.
                </CardContent>
              </Card>
            ) : (
              resolvedRequests.map((r) => (
                <Card key={r.id} className="border-border/80 shadow-sm opacity-90">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-bold text-foreground">
                        {r.assets?.name}
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                    <CardDescription className="text-[10px]">
                      Tag: {r.assets?.asset_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <p className="text-muted-foreground line-clamp-2">"{r.issue_description}"</p>
                    <div className="p-2 rounded bg-slate-50 italic text-[11px] text-muted-foreground leading-normal">
                      Resolution: "{r.resolution_notes}"
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between pt-1">
                      <span>Repair Cost: ${Number(r.cost || 0).toLocaleString()}</span>
                      <span>Resolved: {formatDate(r.updated_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Assign Technician Dialog */}
      {activeRequest && openAssign && (
        <Dialog open={openAssign} onOpenChange={setOpenAssign}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Service Technician</DialogTitle>
              <DialogDescription>
                Assign an internal technician or contractor to service: <span className="font-semibold text-foreground">{activeRequest.assets?.name}</span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="tech-name">Technician / Vendor Name</Label>
                <Input id="tech-name" value={technician} onChange={e => setTechnician(e.target.value)} required placeholder="e.g. John Doe (IT Support Tech)" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
                  {loading ? 'Assigning...' : 'Approve & Assign'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve Dialog */}
      {activeRequest && openResolve && (
        <Dialog open={openResolve} onOpenChange={setOpenResolve}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Maintenance Ticket</DialogTitle>
              <DialogDescription>
                Record resolution summaries and repair costs to restore item back to Available storage stock.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResolveSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="resolve-notes">Resolution Details</Label>
                <Textarea id="resolve-notes" value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} required placeholder="Describe what was repaired/replaced..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolve-cost">Service Cost (USD)</Label>
                <Input id="resolve-cost" type="number" min={0} value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? 'Resolving...' : 'Complete Resolve'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
