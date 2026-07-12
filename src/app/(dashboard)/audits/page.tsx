import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuditsClient from '@/components/audits/AuditsClient'

export const revalidate = 0 // Always fetch fresh asset records for audits

export default async function AuditsPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Validate user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'employee'
  const isAuthorized = userRole === 'admin' || userRole === 'asset_manager' || userRole === 'department_head'
  
  if (!isAuthorized) {
    redirect('/dashboard') // Safely redirect standard employees
  }

  // 3. Fetch assets with categories and departments
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, asset_id, status, department_id, condition, categories(name)')
    .neq('status', 'retired')
    .neq('status', 'disposed')
    .order('name')

  // 4. Fetch all active departments
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')

  return (
    <AuditsClient 
      assets={assets || []}
      departments={departments || []}
    />
  )
}
