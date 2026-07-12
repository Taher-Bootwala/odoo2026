import { createClient } from '@/lib/supabase/server'
import AllocationsClient from './AllocationsClient'

export default async function AllocationsPage() {
  const supabase = await createClient()

  const { data: allocations } = await supabase
    .from('asset_allocations')
    .select('*, assets(name), users(full_name)')
    .order('allocated_at', { ascending: false })

  const { data: assets } = await supabase
    .from('assets')
    .select('id, name')
    .eq('status', 'available')
    .order('name')

  const { data: employees } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name')

  return (
    <AllocationsClient 
      initialAllocations={allocations || []} 
      assets={assets || []} 
      employees={employees || []}
    />
  )
}
