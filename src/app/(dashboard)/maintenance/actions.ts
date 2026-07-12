'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addMaintenanceRequest(formData: FormData) {
  const supabase = await createClient()

  const asset_id = formData.get('asset_id') as string
  const priority = formData.get('priority') as string
  const issue_description = formData.get('issue_description') as string

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Insert the maintenance request
  const { error: requestError } = await supabase
    .from('maintenance_requests')
    .insert([{
      asset_id,
      priority: priority as any,
      issue_description,
      reported_by: user.id
    }])

  if (requestError) {
    console.error('Failed to add request', requestError)
    return { error: requestError.message }
  }

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'maintenance',
    metadata: { asset_id },
    description: `Created ${priority} priority maintenance request`
  }])

  revalidatePath('/maintenance')
  revalidatePath('/activities')
  
  return { success: true }
}
