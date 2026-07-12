'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const resource_id = formData.get('resource_id') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const purpose = formData.get('purpose') as string

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Validate times
  if (new Date(start_time) >= new Date(end_time)) {
    return { error: 'End time must be after start time' }
  }

  // Insert the booking
  const { error: requestError } = await supabase
    .from('bookings')
    .insert([{
      resource_id,
      start_time,
      end_time,
      purpose,
      booked_by: user.id
    }])

  if (requestError) {
    console.error('Failed to create booking', requestError)
    return { error: requestError.message }
  }

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'bookings',
    metadata: { resource_id },
    description: `Booked resource from ${new Date(start_time).toLocaleString()} to ${new Date(end_time).toLocaleString()}`
  }])

  revalidatePath('/bookings')
  revalidatePath('/activities')
  
  return { success: true }
}
