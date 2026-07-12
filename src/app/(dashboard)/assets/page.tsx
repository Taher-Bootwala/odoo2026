import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssetDirectory from '@/components/assets/AssetDirectory'

export const revalidate = 0 // Always fetch fresh asset records

export default async function AssetsPage() {
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

  // 3. Fetch assets joined with category info and holder profile
  const { data: assets } = await supabase
    .from('assets')
    .select('*, categories(name, icon), current_holder:users!assets_current_holder_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  // 4. Fetch list categories and departments for registration dropdowns
  const [categoriesRes, departmentsRes] = await Promise.all([
    supabase.from('categories').select('id, name').eq('status', 'active').order('name'),
    supabase.from('departments').select('id, name, code').eq('status', 'active').order('name')
  ])

  const categories = categoriesRes.data || []
  const departments = departmentsRes.data || []

  return (
    <AssetDirectory 
      initialAssets={assets || []} 
      categories={categories}
      departments={departments}
      userRole={userRole}
    />
  )
}
