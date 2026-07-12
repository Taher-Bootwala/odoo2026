import { createClient } from '@/lib/supabase/server'
import TransfersClient from './TransfersClient'

export default async function TransfersPage() {
  const supabase = await createClient()

  const { data: transfers } = await supabase
    .from('asset_transfers')
    .select('*, assets(name)')
    .order('created_at', { ascending: false })

  const { data: assets } = await supabase
    .from('assets')
    .select('id, name')
    .order('name')

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  return (
    <TransfersClient 
      initialTransfers={transfers || []} 
      assets={assets || []} 
      departments={departments || []}
    />
  )
}
