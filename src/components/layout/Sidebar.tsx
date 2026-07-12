'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowLeftRight, 
  Wrench, 
  Calendar, 
  Settings, 
  History, 
  BarChart3, 
  ClipboardCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [role, setRole] = useState<string>('employee')

  useEffect(() => {
    const supabase = createClient()
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        if (data?.role) {
          setRole(data.role)
        }
      }
    }
    getProfile()
  }, [])

  const navItems = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
        { href: '/assets', label: 'Asset Directory', icon: Package, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
        { href: '/allocations', label: 'Allocations', icon: Users, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
        { href: '/bookings', label: 'Bookings', icon: Calendar, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
      ]
    },
    {
      title: 'Workflows',
      items: [
        { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
        { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
        { href: '/audits', label: 'Asset Audits', icon: ClipboardCheck, roles: ['admin', 'asset_manager', 'department_head'] },
      ]
    },
    {
      title: 'Admin',
      items: [
        { href: '/org-setup', label: 'Organization Setup', icon: Settings, roles: ['admin'] },
        { href: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'asset_manager'] },
        { href: '/activities', label: 'Activity Logs', icon: History, roles: ['admin'] },
      ]
    }
  ]

  return (
    <aside
      className={cn(
        "h-[calc(100vh-4rem)] border-r border-border bg-white flex flex-col justify-between transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {navItems.map((group) => {
          // Filter items based on user's role
          const visibleItems = group.items.filter(item => item.roles.includes(role))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title} className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground")} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-3 border-t border-border flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
