'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ArrowRightLeft, HelpCircle } from 'lucide-react'
import { approveTransfer, rejectTransfer } from '@/app/(dashboard)/transfers/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getStatusColor, formatStatus, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface TransferBoardProps {
  transfers: any[]
  userRole: string
  userId: string
}

export default function TransferBoard({ transfers, userRole, userId }: TransferBoardProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'asset_manager' || userRole === 'department_head'

  const handleApprove = async (id: string) => {
    setLoading(id)
    try {
      await approveTransfer(id)
      toast.success('Transfer request approved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve transfer')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setLoading(id)
    try {
      await rejectTransfer(id)
      toast.success('Transfer request rejected!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject transfer')
    } finally {
      setLoading(null)
    }
  }

  // Filter transfers into groups
  const pendingTransfers = transfers.filter(t => t.status === 'requested')
  const completedTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'dept_head_approved' || t.status === 'asset_manager_approved')
  const rejectedTransfers = transfers.filter(t => t.status === 'rejected')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Asset Transfers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, approve, or reject physical asset re-assignment transfers between team members.
        </p>
      </div>

      {/* Grid for different columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Pending Requests
            </h2>
            <Badge variant="secondary" className="bg-amber-50 text-amber-700">{pendingTransfers.length}</Badge>
          </div>

          <div className="space-y-3">
            {pendingTransfers.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-8 text-center text-muted-foreground text-xs">
                  No pending transfer requests.
                </CardContent>
              </Card>
            ) : (
              pendingTransfers.map((t) => (
                <Card key={t.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-primary shrink-0" />
                      {t.assets?.name}
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Tag: {t.assets?.asset_id} | Requested {formatDate(t.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-50/50 space-y-1.5 border border-border/60">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase block">Transfer From:</span>
                        <span className="font-semibold">{t.from_employee?.full_name || 'Org Stock'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase block">Transfer To:</span>
                        <span className="font-semibold text-primary">{t.to_employee?.full_name}</span>
                      </div>
                    </div>

                    {t.reason && (
                      <p className="text-muted-foreground text-[11px] leading-normal italic bg-slate-50 p-2 rounded">
                        Reason: "{t.reason}"
                      </p>
                    )}

                    {isManagerOrAdmin && (
                      <div className="flex gap-2 pt-1.5">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(t.id)}
                          disabled={!!loading} 
                          className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs h-8"
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleReject(t.id)}
                          disabled={!!loading} 
                          className="flex-1 text-destructive hover:bg-destructive/5 hover:text-destructive border-border text-xs h-8"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Completed Transfers
            </h2>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{completedTransfers.length}</Badge>
          </div>

          <div className="space-y-3">
            {completedTransfers.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-8 text-center text-muted-foreground text-xs">
                  No completed transfer records.
                </CardContent>
              </Card>
            ) : (
              completedTransfers.map((t) => (
                <Card key={t.id} className="border-border/80 shadow-sm opacity-90">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      {t.assets?.name}
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Tag: {t.assets?.asset_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 space-y-1">
                      <div className="text-muted-foreground">From: <span className="font-medium text-foreground">{t.from_employee?.full_name}</span></div>
                      <div className="text-muted-foreground">To: <span className="font-semibold text-foreground">{t.to_employee?.full_name}</span></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Completed Date: {formatDate(t.updated_at)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Rejected column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-md text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Rejected Transfers
            </h2>
            <Badge variant="secondary" className="bg-red-50 text-red-700">{rejectedTransfers.length}</Badge>
          </div>

          <div className="space-y-3">
            {rejectedTransfers.length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-8 text-center text-muted-foreground text-xs">
                  No rejected transfer requests.
                </CardContent>
              </Card>
            ) : (
              rejectedTransfers.map((t) => (
                <Card key={t.id} className="border-border/80 shadow-sm opacity-80">
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      {t.assets?.name}
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Tag: {t.assets?.asset_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 space-y-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 space-y-1">
                      <div className="text-muted-foreground">Proposed: <span className="font-medium text-foreground">{t.to_employee?.full_name}</span></div>
                    </div>
                    {t.remarks && (
                      <p className="text-[10px] text-red-600 italic">
                        Note: "{t.remarks}"
                      </p>
                    )}
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Rejected Date: {formatDate(t.updated_at)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
