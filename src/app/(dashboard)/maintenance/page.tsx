import { createClient } from '@/lib/supabase/server'
import MaintenanceClient from './MaintenanceClient'

export default async function MaintenancePage() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('maintenance_requests')
    .select('*, assets(name)')
    .order('created_at', { ascending: false })

  const { data: assets } = await supabase
    .from('assets')
    .select('id, name')
    .order('name')

  return (
    <MaintenanceClient initialRequests={requests || []} assets={assets || []} />
  )
}
