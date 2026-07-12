import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MaintenanceBoard from '@/components/maintenance/MaintenanceBoard'

export const revalidate = 0 // Always fetch fresh maintenance records

export default async function MaintenancePage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'employee'

  // 3. Fetch all maintenance requests with relations
  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('*, assets(name, asset_id, status), users:users!maintenance_requests_reported_by_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  // 4. Fetch list of assets for raising new tickets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, asset_id')
    .neq('status', 'retired')
    .neq('status', 'disposed')
    .order('name')

  return (
    <MaintenanceBoard 
      initialRequests={requests || []} 
      assets={assets || []} 
      userRole={userRole}
      userId={user.id}
    />
  )
}
