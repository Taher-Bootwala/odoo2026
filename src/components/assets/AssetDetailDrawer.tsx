'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getStatusColor, formatStatus, formatDate } from '@/lib/utils'

interface AssetDetailDrawerProps {
  asset: any | null
  open: boolean
  onClose: () => void
}

export default function AssetDetailDrawer({ asset, open, onClose }: AssetDetailDrawerProps) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asset || !open) return

    const supabase = createClient()
    async function loadHistory() {
      setLoading(true)
      try {
        // Fetch Allocation History
        const { data: allocs } = await supabase
          .from('asset_allocations')
          .select('*, users(full_name, email)')
          .eq('asset_id', asset.id)
          .order('allocated_at', { ascending: false })
        
        // Fetch Maintenance History
        const { data: maints } = await supabase
          .from('maintenance_requests')
          .select('*, users(full_name)')
          .eq('asset_id', asset.id)
          .order('created_at', { ascending: false })

        setAllocations(allocs || [])
        setMaintenance(maints || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [asset, open])

  if (!asset) return null

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl font-bold">{asset.name}</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Tag: {asset.asset_id} | Serial: {asset.serial_number || 'N/A'}
          </SheetDescription>
          <div className="pt-2">
            <Badge variant="outline" className={getStatusColor(asset.status)}>
              {formatStatus(asset.status)}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="my-6" />

        <Tabs defaultValue="overview" className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 bg-secondary/50 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-4 text-sm focus-visible:outline-none">
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <span className="text-xs text-muted-foreground block">Category</span>
                <span className="font-semibold">{asset.categories?.name || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Condition</span>
                <span className="font-semibold capitalize">{asset.condition}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Purchase Date</span>
                <span className="font-semibold">{asset.purchase_date ? formatDate(asset.purchase_date) : '-'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Purchase Cost</span>
                <span className="font-semibold">{asset.purchase_cost ? `$${Number(asset.purchase_cost).toLocaleString()}` : '-'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Location / Shelf</span>
                <span className="font-semibold">{asset.location || '-'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Shared Resource</span>
                <span className="font-semibold">{asset.is_shared_resource ? `Yes (${formatStatus(asset.resource_type || '')})` : 'No'}</span>
              </div>
              {asset.warranty_expiry && (
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Warranty Expiry Date</span>
                  <span className="font-semibold text-primary">{formatDate(asset.warranty_expiry)}</span>
                </div>
              )}
              {asset.description && (
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Description & Technical Notes</span>
                  <p className="mt-1 text-xs text-muted-foreground leading-normal whitespace-pre-line">{asset.description}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Allocation History Content */}
          <TabsContent value="allocations" className="focus-visible:outline-none">
            {loading ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Loading allocation history...</p>
            ) : allocations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No allocation records found.</p>
            ) : (
              <div className="space-y-4 py-2">
                {allocations.map((alloc) => (
                  <div key={alloc.id} className="border border-border rounded-lg p-3 bg-secondary/15 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{alloc.users?.full_name}</span>
                      <Badge variant="outline" className={getStatusColor(alloc.status)}>
                        {alloc.status === 'active' ? 'Active' : 'Returned'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                      <div>Allocated: {formatDate(alloc.allocated_at)}</div>
                      <div>Returned: {alloc.actual_return_date ? formatDate(alloc.actual_return_date) : '-'}</div>
                      <div className="col-span-2">Expected Return: {alloc.expected_return_date ? formatDate(alloc.expected_return_date) : 'Indefinite'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maintenance History Content */}
          <TabsContent value="maintenance" className="focus-visible:outline-none">
            {loading ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Loading maintenance history...</p>
            ) : maintenance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No maintenance logs recorded.</p>
            ) : (
              <div className="space-y-4 py-2">
                {maintenance.map((maint) => (
                  <div key={maint.id} className="border border-border rounded-lg p-3 bg-secondary/15 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold capitalize">{maint.priority} Priority</span>
                      <Badge variant="outline" className={getStatusColor(maint.status)}>
                        {formatStatus(maint.status)}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground">{maint.issue_description}</p>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground text-[10px]">
                      <div>Reported: {formatDate(maint.created_at)}</div>
                      <div>Cost: {maint.cost ? `$${Number(maint.cost).toLocaleString()}` : '-'}</div>
                    </div>
                    {maint.resolution_notes && (
                      <p className="text-[11px] bg-white border border-border p-2 rounded text-muted-foreground italic mt-1">
                        Resolution: {maint.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
