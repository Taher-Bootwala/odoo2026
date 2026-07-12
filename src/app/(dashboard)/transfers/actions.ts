'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function initiateTransfer(formData: FormData) {
  const supabase = await createClient()

  const asset_id = formData.get('asset_id') as string
  const to_department_id = formData.get('to_department_id') as string
  const reason = formData.get('reason') as string

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Insert the transfer request
  const { error: requestError } = await supabase
    .from('asset_transfers')
    .insert([{
      asset_id,
      to_department_id,
      reason,
      requested_by: user.id
    }])

  if (requestError) {
    console.error('Failed to initiate transfer', requestError)
    return { error: requestError.message }
  }

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'transfers',
    metadata: { asset_id, to_department_id },
    description: `Initiated transfer for asset to new department`
  }])

  revalidatePath('/transfers')
  revalidatePath('/activities')
  
  return { success: true }
}
