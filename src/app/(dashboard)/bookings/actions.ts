'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function createBooking(formData: {
  resource_id: string
  start_time: string
  end_time: string
  purpose?: string
  remarks?: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  const reqStart = new Date(formData.start_time).toISOString()
  const reqEnd = new Date(formData.end_time).toISOString()

  if (new Date(reqStart) >= new Date(reqEnd)) {
    throw new Error('Start time must be before end time')
  }

  // 1. Check if asset is shared bookable resource
  const { data: asset } = await supabase
    .from('assets')
    .select('name, is_shared_resource, status')
    .eq('id', formData.resource_id)
    .single()

  if (!asset) throw new Error('Resource asset not found')
  if (!asset.is_shared_resource) {
    throw new Error('This asset is not registered as a bookable shared resource')
  }
  if (asset.status === 'under_maintenance') {
    throw new Error('This resource is currently under maintenance and cannot be booked')
  }

  // 2. Interval overlap validation (half-open interval rule)
  // Look for any confirmed/in-progress booking where start < requestedEnd AND end > requestedStart
  const { data: overlaps, error: overlapErr } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('resource_id', formData.resource_id)
    .in('status', ['confirmed', 'in_progress'])
    .lt('start_time', reqEnd)
    .gt('end_time', reqStart)

  if (overlapErr) throw new Error(overlapErr.message)

  if (overlaps && overlaps.length > 0) {
    throw new Error('Booking conflict: The requested slot overlaps with an existing booking.')
  }

  // 3. Insert booking
  const { error } = await supabase
    .from('bookings')
    .insert({
      resource_id: formData.resource_id,
      booked_by: user.id,
      start_time: reqStart,
      end_time: reqEnd,
      purpose: formData.purpose || null,
      remarks: formData.remarks || null,
      status: 'confirmed'
    })

  if (error) throw new Error(error.message)

  // Notify recipient
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Booking Confirmed',
    message: `Your booking for "${asset.name}" has been confirmed for ${new Date(reqStart).toLocaleString()} - ${new Date(reqEnd).toLocaleString()}.`,
    type: 'booking_confirmed'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'RESOURCE_BOOKED',
    module: 'BOOKINGS',
    description: `Shared resource "${asset.name}" booked.`,
  })

  revalidatePath('/bookings')
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, assets:assets(name)')
    .eq('id', bookingId)
    .single()

  if (!booking) throw new Error('Booking record not found')

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'BOOKING_CANCELLED',
    module: 'BOOKINGS',
    description: `Booking for "${booking.assets?.name}" cancelled.`,
  })

  revalidatePath('/bookings')
}
