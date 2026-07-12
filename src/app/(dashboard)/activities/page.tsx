import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { History, ShieldAlert } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export const revalidate = 0 // Always fetch fresh activity logs

export default async function ActivitiesPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Validate user is Admin (PRD Screen 10 is Admin/Manager view)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'asset_manager'
  if (!isAuthorized) {
    redirect('/dashboard') // Safely redirect non-admins
  }

  // 3. Fetch activity logs
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  const getActionColor = (action: string) => {
    if (action.includes('REGISTERED') || action.includes('CREATED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (action.includes('ALLOCATED') || action.includes('BOOKED')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (action.includes('RETURNED') || action.includes('RESOLVED')) return 'bg-purple-50 text-purple-700 border-purple-200'
    if (action.includes('MUTATED') || action.includes('UPDATED')) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-50 text-slate-600 border-slate-200'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          System Activity Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review org-wide transactional audit trails, asset state transitions, and user actions.
        </p>
      </div>

      {/* Logs Table */}
      <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User / Actor</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action Trigger</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!logs || logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-sm">
                  No activity logs recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{log.users?.full_name || 'System'}</div>
                    <div className="text-[10px] text-muted-foreground">{log.users?.email || ''}</div>
                  </TableCell>
                  <TableCell className="uppercase text-[11px] font-bold text-slate-500">
                    {log.module}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground max-w-sm font-medium">
                    {log.description}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
