import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingCalendar from '@/components/bookings/BookingCalendar'

export const revalidate = 0 // Always fetch fresh booking records

export default async function BookingsPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch all bookings with relations
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, assets:assets(name, asset_id, location, status), booked_by_user:users!bookings_booked_by_fkey(full_name, email)')
    .order('start_time', { ascending: true })

  // 3. Fetch bookable resources list
  const { data: resources } = await supabase
    .from('assets')
    .select('id, name, resource_type')
    .eq('is_shared_resource', true)
    .neq('status', 'retired')
    .neq('status', 'disposed')
    .order('name')

  return (
    <BookingCalendar 
      initialBookings={bookings || []} 
      resources={resources || []}
      userId={user.id}
    />
  )
}
