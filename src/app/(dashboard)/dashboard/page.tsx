import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  UserCheck, 
  AlertTriangle, 
  Wrench, 
  CalendarDays, 
  ArrowRightLeft, 
  Plus, 
  ClipboardList, 
  History 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime, getStatusColor } from '@/lib/utils'

export const revalidate = 0 // Disable caching to ensure realtime updates

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user profile role
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, department_id')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'employee'
  const isEmployee = userRole === 'employee'
  const isDeptHead = userRole === 'department_head'
  const isManagerOrAdmin = userRole === 'asset_manager' || userRole === 'admin'

  // Build queries based on role scope
  // For Employee: show own allocations, bookings, maintenance, transfers
  // For Dept Head: show department-scoped metrics
  // For Admin/Asset Manager: show org-wide metrics

  // Fetch asset statistics
  let assetQuery = supabase.from('assets').select('id, status', { count: 'exact' })
  if (isEmployee) {
    assetQuery = assetQuery.eq('current_holder_id', user.id)
  } else if (isDeptHead && profile?.department_id) {
    assetQuery = assetQuery.eq('department_id', profile.department_id)
  }
  const { data: assets, count: totalAssets } = await assetQuery

  // Count statuses
  const availableCount = assets?.filter(a => a.status === 'available').length || 0
  const allocatedCount = assets?.filter(a => a.status === 'allocated').length || 0
  const maintenanceCount = assets?.filter(a => a.status === 'under_maintenance').length || 0

  // Fetch pending transfers
  let transfersQuery = supabase.from('asset_transfers').select('id', { count: 'exact' }).eq('status', 'requested')
  if (isEmployee) {
    transfersQuery = transfersQuery.or(`from_employee_id.eq.${user.id},to_employee_id.eq.${user.id}`)
  } else if (isDeptHead && profile?.department_id) {
    transfersQuery = transfersQuery.or(`from_department_id.eq.${profile.department_id},to_department_id.eq.${profile.department_id}`)
  }
  const { count: pendingTransfers } = await transfersQuery

  // Fetch active bookings
  let bookingsQuery = supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'confirmed')
  if (isEmployee) {
    bookingsQuery = bookingsQuery.eq('booked_by', user.id)
  }
  const { count: activeBookings } = await bookingsQuery

  // Fetch overdue allocations count
  const todayStr = new Date().toISOString().split('T')[0]
  let overdueQuery = supabase
    .from('asset_allocations')
    .select('id, expected_return_date, assets(name, asset_id), users(full_name)')
    .eq('status', 'active')
    .lt('expected_return_date', todayStr)

  if (isEmployee) {
    overdueQuery = overdueQuery.eq('employee_id', user.id)
  } else if (isDeptHead && profile?.department_id) {
    overdueQuery = overdueQuery.eq('department_id', profile.department_id)
  }
  const { data: overdueAllocations } = await overdueQuery

  // Fetch recent activity logs (Admin / Manager only)
  let activityLogs: any[] = []
  if (isManagerOrAdmin) {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false })
      .limit(6)
    activityLogs = data || []
  }

  // Fetch user's current allocations
  const { data: myAllocations } = await supabase
    .from('asset_allocations')
    .select('*, assets(name, asset_id, status)')
    .eq('employee_id', user.id)
    .eq('status', 'active')
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Welcome Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, <span className="font-semibold text-foreground">{profile?.full_name}</span>. Here is your overview.
          </p>
        </div>
        
        {/* Quick Action Actions */}
        <div className="flex flex-wrap gap-2">
          {isManagerOrAdmin && (
            <Link 
              href="/assets" 
              className={buttonVariants({ size: "sm", className: "bg-primary hover:bg-primary/90 text-white gap-1.5" })}
            >
              <Plus className="h-4 w-4" />
              Register Asset
            </Link>
          )}
          <Link 
            href="/bookings" 
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 border-border hover:bg-secondary" })}
          >
            <Plus className="h-4 w-4" />
            Book Resource
          </Link>
          <Link 
            href="/maintenance" 
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 border-border hover:bg-secondary" })}
          >
            <Plus className="h-4 w-4" />
            Raise Maintenance
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isEmployee ? 'My Assets' : 'Total Assets'}
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAssets || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Registered physical assets</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{availableCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for allocation</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Allocated
            </CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{allocatedCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Currently in-use</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{maintenanceCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Currently being serviced</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overdue / Actions panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue alert section */}
          {overdueAllocations && overdueAllocations.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <CardTitle className="text-destructive text-base font-bold">Overdue Return Alerts</CardTitle>
                  <CardDescription className="text-destructive/80 text-xs">
                    Please return these assets immediately or request an extension.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-destructive/10 border-t border-destructive/10 max-h-60 overflow-y-auto">
                  {overdueAllocations.map((alloc: any) => (
                    <div key={alloc.id} className="p-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-destructive">{alloc.assets?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tag: {alloc.assets?.asset_id} | Holder: {alloc.users?.full_name}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold">
                        Due: {formatDate(alloc.expected_return_date)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current user's holdings / allocations */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">My Active Allocations</CardTitle>
              <CardDescription className="text-xs">
                Assets currently allocated to you
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border border-t border-border">
                {!myAllocations || myAllocations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    You have no active asset allocations.
                  </div>
                ) : (
                  myAllocations.map((alloc) => (
                    <div key={alloc.id} className="p-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-foreground">{alloc.assets?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Tag: {alloc.assets?.asset_id} | Allocated: {formatDate(alloc.allocated_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor('active')}>
                          Active
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Expected Return: {alloc.expected_return_date ? formatDate(alloc.expected_return_date) : 'Indefinite'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary sidebar panel (transfers/bookings/activities) */}
        <div className="space-y-6">
          {/* Quick Metrics */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-primary" />
                Workflows Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pending Transfer Requests</span>
                <Badge variant="secondary" className="font-semibold bg-amber-50 text-amber-700">
                  {pendingTransfers || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Active Resource Bookings</span>
                <Badge variant="secondary" className="font-semibold bg-purple-50 text-purple-700">
                  {activeBookings || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed (Admins/Managers) */}
          {isManagerOrAdmin && (
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <History className="h-4 w-4 text-primary" />
                  Recent Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border border-t border-border max-h-[350px] overflow-y-auto">
                  {activityLogs.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs">
                      No recent activities recorded.
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="p-3.5 space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-foreground">{log.users?.full_name || 'System'}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(log.created_at)}</span>
                        </div>
                        <p className="text-muted-foreground leading-normal">
                          <span className="font-semibold text-primary">{log.action}</span> - {log.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
