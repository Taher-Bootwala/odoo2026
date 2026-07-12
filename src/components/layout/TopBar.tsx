'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  Search, 
  ShieldAlert, 
  Settings, 
  Check,
  Building
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, getRoleColor, formatRole } from '@/lib/utils'

export default function TopBar() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string; role: string } | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    async function loadUserAndNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Load Profile
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single()
        if (profile) {
          setUserInfo(profile)
        }

        // Load Notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (notifs) {
          setNotifications(notifs)
          setUnreadCount(notifs.filter(n => !n.read).length)
        }
      }
    }
    loadUserAndNotifications()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  return (
    <header className="h-16 border-b border-border bg-white sticky top-0 z-50 flex items-center justify-between px-6 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Building className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Asset<span className="text-primary">Flow</span>
          </span>
        </Link>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger render={
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" />
          }>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-primary rounded-full ring-2 ring-white animate-pulse" />
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-4" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80" onClick={markAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-3 p-4 border-b border-border hover:bg-secondary/25 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      if (n.link) router.push(n.link)
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-xs text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Profile Dropdown */}
        {userInfo && (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="relative h-9 w-9 rounded-full select-none" />
            }>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(userInfo.full_name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{userInfo.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
                  <div className="pt-2">
                    <Badge variant="outline" className={getRoleColor(userInfo.role)}>
                      {formatRole(userInfo.role)}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
