import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function AssetsPage() {
  const supabase = await createClient()

  // Fetch assets and activity logs from Supabase
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*, categories(name, icon)')
    
  const { data: activityLogs, error: activityError } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  const { data: employees } = await supabase
    .from('users')
    .select('id, full_name')
    .order('full_name')

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')

  return (
    <DashboardClient 
      initialAssets={assets || []} 
      initialActivities={activityLogs || []} 
      categories={categories || []}
      employees={employees || []}
      departments={departments || []}
    />
  )
}
