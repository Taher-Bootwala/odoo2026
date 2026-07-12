import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AllocationTable from '@/components/allocations/AllocationTable'

export const revalidate = 0 // Always fetch fresh allocation records

export default async function AllocationsPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch User Profile role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'employee'

  // 3. Fetch allocations joined with asset name and employee name
  const { data: allocations } = await supabase
    .from('asset_allocations')
    .select('*, assets(name, asset_id), users(full_name, email)')
    .order('allocated_at', { ascending: false })

  // 4. Fetch ALL active assets (for checkout & conflict mapping)
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, status')
    .neq('status', 'retired')
    .neq('status', 'disposed')
    .order('name')

  // 5. Fetch employees for checkout dropdown
  const { data: employees } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('status', 'active')
    .order('full_name')

  return (
    <AllocationTable 
      initialAllocations={allocations || []} 
      assets={assets || []} 
      employees={employees || []}
      userRole={userRole}
    />
  )
}
