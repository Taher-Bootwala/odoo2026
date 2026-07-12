'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Check, AlertOctagon, HelpCircle, Archive, ClipboardCheck, Lock, ShieldAlert } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils'

interface AuditsClientProps {
  assets: any[]
  departments: any[]
}

interface AuditCycle {
  id: string
  name: string
  departmentId: string
  status: 'active' | 'closed'
  created_at: string
  items: Record<string, { result: 'verified' | 'missing' | 'damaged'; note: string }>
}

export default function AuditsClient({ assets, departments }: AuditsClientProps) {
  const [cycles, setCycles] = useState<AuditCycle[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [loading, setLoading] = useState(false)

  // Create Form State
  const [name, setName] = useState('')
  const [deptId, setDeptId] = useState('')

  // Active viewing state
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('assetflow_audit_cycles')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCycles(parsed)
        if (parsed.length > 0) {
          // default to latest active cycle or first cycle
          const active = parsed.find((c: any) => c.status === 'active') || parsed[0]
          setActiveCycle(active)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const saveCycles = (newCycles: AuditCycle[]) => {
    setCycles(newCycles)
    localStorage.setItem('assetflow_audit_cycles', JSON.stringify(newCycles))
    if (activeCycle) {
      const updated = newCycles.find(c => c.id === activeCycle.id)
      if (updated) setActiveCycle(updated)
    }
  }

  // Create audit cycle
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptId || !name) {
      toast.error('All fields are required')
      return
    }

    const newCycle: AuditCycle = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      departmentId: deptId,
      status: 'active',
      created_at: new Date().toISOString(),
      items: {}
    }

    const updated = [newCycle, ...cycles]
    saveCycles(updated)
    setActiveCycle(newCycle)
    setOpenCreate(false)
    setName('')
    setDeptId('')
    toast.success('Audit Cycle initiated successfully!')
  }

  // Update item verification result
  const handleCheckItem = (assetId: string, result: 'verified' | 'missing' | 'damaged', note: string = '') => {
    if (!activeCycle || activeCycle.status === 'closed') return

    const updatedCycles = cycles.map(c => {
      if (c.id === activeCycle.id) {
        return {
          ...c,
          items: {
            ...c.items,
            [assetId]: { result, note }
          }
        }
      }
      return c
    })
    saveCycles(updatedCycles)
  }

  // Close cycle
  const handleCloseCycle = () => {
    if (!activeCycle) return
    if (!confirm('Are you sure you want to close this audit cycle? This will lock all checklist entries.')) return

    const updatedCycles = cycles.map(c => {
      if (c.id === activeCycle.id) {
        return {
          ...c,
          status: 'closed' as const
        }
      }
      return c
    })
    saveCycles(updatedCycles)
    toast.success('Audit cycle locked and closed successfully.')
  }

  // Get assets scoped to the active cycle department
  const scopedAssets = useMemo(() => {
    if (!activeCycle) return []
    return assets.filter(a => a.department_id === activeCycle.departmentId)
  }, [activeCycle, assets])

  // Compute discrepancy report items
  const discrepancyItems = useMemo(() => {
    if (!activeCycle) return []
    return scopedAssets.filter(asset => {
      const item = activeCycle.items[asset.id]
      return item && (item.result === 'missing' || item.result === 'damaged')
    })
  }, [activeCycle, scopedAssets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Periodic Asset Auditing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Initiate stock count verification audits, log checklist discrepancies, and close audit cycles.
          </p>
        </div>

        {/* Create Audit Cycle Dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
          }>
            <Plus className="h-4 w-4" /> Start Audit Cycle
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Audit Cycle</DialogTitle>
              <DialogDescription>
                Select scope parameters to verify physical inventory checklist.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="audit-name">Audit Cycle Name</Label>
                <Input id="audit-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Q3 Headquarters Stock Count" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audit-dept">Target Department Scope</Label>
                <Select value={deptId} onValueChange={(val) => setDeptId(val || '')}>
                  <SelectTrigger id="audit-dept">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  Start Cycle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Select Active Cycle dropdown */}
      {cycles.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full max-w-sm">
            <Label htmlFor="cycle-select" className="shrink-0 font-bold text-xs uppercase tracking-wider text-muted-foreground">Select Audit:</Label>
            <Select value={activeCycle?.id} onValueChange={id => {
              const cyc = cycles.find(c => c.id === id)
              if (cyc) setActiveCycle(cyc)
            }}>
              <SelectTrigger id="cycle-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.status === 'active' ? 'Active' : 'Closed'})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {activeCycle && activeCycle.status === 'active' && (
              <Button size="sm" onClick={handleCloseCycle} className="bg-destructive hover:bg-destructive/90 text-white gap-1.5 h-9">
                <Lock className="h-4 w-4" /> Close & Lock Cycle
              </Button>
            )}
            {activeCycle && activeCycle.status === 'closed' && (
              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 gap-1.5 h-8 px-3 text-xs">
                <Lock className="h-3.5 w-3.5" /> Immutable Archive Locked
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Active Audit Layout */}
      {!activeCycle ? (
        <Card className="border-dashed border-border bg-slate-50/20 py-16 text-center">
          <CardContent className="space-y-3">
            <ClipboardCheck className="h-12 w-12 mx-auto opacity-30 text-primary" />
            <h3 className="font-bold text-lg">No Audit Cycles Initiated</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Create a new periodic stock count verification cycle above to reconcile physical inventory assets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Scoped Checklist Table */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5">
              Checklist Scope ({scopedAssets.length} items)
            </h2>

            <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead className="w-64">Verification Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scopedAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-sm">
                        No assets registered under this department scope.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scopedAssets.map((asset) => {
                      const item = activeCycle.items[asset.id]
                      const result = item?.result
                      return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-bold text-foreground">{asset.asset_id}</TableCell>
                          <TableCell className="font-semibold text-foreground">{asset.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(asset.status)}>
                              {formatStatus(asset.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant={result === 'verified' ? 'default' : 'outline'}
                                className={result === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px] font-medium' : 'border-border text-[11px] font-medium h-8'}
                                disabled={activeCycle.status === 'closed'}
                                onClick={() => handleCheckItem(asset.id, 'verified')}
                              >
                                Verified
                              </Button>
                              <Button 
                                size="sm" 
                                variant={result === 'missing' ? 'default' : 'outline'}
                                className={result === 'missing' ? 'bg-destructive hover:bg-destructive/95 text-white h-8 text-[11px] font-medium' : 'border-border text-[11px] font-medium h-8'}
                                disabled={activeCycle.status === 'closed'}
                                onClick={() => handleCheckItem(asset.id, 'missing')}
                              >
                                Missing
                              </Button>
                              <Button 
                                size="sm" 
                                variant={result === 'damaged' ? 'default' : 'outline'}
                                className={result === 'damaged' ? 'bg-amber-500 hover:bg-amber-600 text-white h-8 text-[11px] font-medium' : 'border-border text-[11px] font-medium h-8'}
                                disabled={activeCycle.status === 'closed'}
                                onClick={() => handleCheckItem(asset.id, 'damaged')}
                              >
                                Damaged
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Discrepancy report side column */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Discrepancy Report
            </h2>

            <Card className="border-border shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-border/80">
                <CardTitle className="text-sm font-bold text-foreground">Out-of-sync Items ({discrepancyItems.length})</CardTitle>
                <CardDescription className="text-[10px]">
                  Any asset marked as missing or damaged triggers a discrepancy flag.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto divide-y divide-border">
                {discrepancyItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs leading-normal">
                    Checklist looks perfect. No discrepancies reported.
                  </div>
                ) : (
                  discrepancyItems.map((asset) => {
                    const result = activeCycle.items[asset.id]?.result
                    return (
                      <div key={asset.id} className="p-4 flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-foreground">{asset.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Tag: {asset.asset_id}</p>
                        </div>
                        <Badge variant="outline" className={result === 'missing' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {result}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </CardContent>
              {activeCycle.status === 'closed' && discrepancyItems.length > 0 && (
                <CardFooter className="bg-slate-50 border-t border-border/80 p-3 flex justify-center text-[10px] text-muted-foreground font-semibold">
                  Report finalized on close.
                </CardFooter>
              )}
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
