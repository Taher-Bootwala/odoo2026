import { createClient } from '@/lib/supabase/server'
import BookingsClient from './BookingsClient'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, assets(name), users(full_name)')
    .order('start_time', { ascending: false })

  const { data: resources } = await supabase
    .from('assets')
    .select('id, name')
    .eq('is_shared_resource', true)
    .order('name')

  return (
    <BookingsClient 
      initialBookings={bookings || []} 
      resources={resources || []}
    />
  )
}
