'use client'

import { useState, useRef, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, X, Calendar, MapPin, Tag } from 'lucide-react'
import { createBooking, cancelBooking } from '@/app/(dashboard)/bookings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatDateTime, formatStatus } from '@/lib/utils'

interface BookingCalendarProps {
  initialBookings: any[]
  resources: any[]
  userId: string
}

export default function BookingCalendar({ initialBookings, resources, userId }: BookingCalendarProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>('all')
  const [openCreate, setOpenCreate] = useState(false)
  const [loading, setLoading] = useState(false)

  // Booking Form State
  const [resourceId, setResourceId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')

  // Map database bookings to FullCalendar event objects
  const filteredBookings = useMemo(() => {
    return initialBookings.filter(b => {
      return (selectedResourceId === 'all' || b.resource_id === selectedResourceId) && b.status !== 'cancelled'
    })
  }, [initialBookings, selectedResourceId])

  const events = useMemo(() => {
    return filteredBookings.map(b => ({
      id: b.id,
      title: `${b.assets?.name} - ${b.purpose || 'Booking'}`,
      start: b.start_time,
      end: b.end_time,
      backgroundColor: b.booked_by === userId ? '#FF9F7C' : '#E2E8F0',
      borderColor: b.booked_by === userId ? '#FF9F7C' : '#CBD5E1',
      textColor: b.booked_by === userId ? '#FFFFFF' : '#1E293B',
      extendedProps: {
        bookedBy: b.booked_by_user?.full_name || 'Staff User',
        resourceName: b.assets?.name,
        resourceLocation: b.assets?.location || 'Org Location',
        isOwnBooking: b.booked_by === userId
      }
    }))
  }, [filteredBookings, userId])

  // Handle calendar slot selection
  const handleSelect = (selectInfo: any) => {
    // Format times for input type="datetime-local" (YYYY-MM-DDTHH:MM)
    const start = new Date(selectInfo.startStr)
    const end = new Date(selectInfo.endStr)
    
    // adjust timezone offset to local YYYY-MM-DDTHH:MM format
    const formatLocal = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    setStartTime(formatLocal(start))
    setEndTime(formatLocal(end))
    if (selectedResourceId !== 'all') {
      setResourceId(selectedResourceId)
    }
    setOpenCreate(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceId) {
      toast.error('Please select a resource asset')
      return
    }

    setLoading(true)
    try {
      await createBooking({
        resource_id: resourceId,
        start_time: startTime,
        end_time: endTime,
        purpose
      })
      toast.success('Resource booking confirmed!')
      setOpenCreate(false)
      
      // Reset
      setResourceId('')
      setStartTime('')
      setEndTime('')
      setPurpose('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule booking')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this resource booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Resource booking cancelled successfully.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Resource Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reserve meeting rooms, vehicles, projectors, or other shared corporate assets.
          </p>
        </div>

        {/* Create Booking dialog */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/95 text-white gap-1.5" />
          }>
            <Plus className="h-4 w-4" /> Book Resource
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Shared Resource</DialogTitle>
              <DialogDescription>
                Schedule an allocation window. Guard rules enforce collision safety.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="book-resource">Select Shared Resource</Label>
                <Select value={resourceId} onValueChange={(val) => setResourceId(val || '')}>
                  <SelectTrigger id="book-resource">
                    <SelectValue placeholder="Choose room/device" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({formatStatus(r.resource_type || '')})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book-start">Start Time</Label>
                  <Input id="book-start" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-end">End Time</Label>
                  <Input id="book-end" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-purpose">Booking Purpose</Label>
                <Textarea id="book-purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Project kick-off scrum team meeting..." required />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  {loading ? 'Processing...' : 'Confirm Reservation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Label htmlFor="calendar-filter" className="shrink-0">Filter Resource:</Label>
          <Select value={selectedResourceId} onValueChange={(val) => setSelectedResourceId(val || '')}>
            <SelectTrigger id="calendar-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shared Resources</SelectItem>
              {resources.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-primary" />
            Your Bookings
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-200 border border-slate-300" />
            Other Bookings
          </div>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FullCalendar wrapper */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-4 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            initialView="timeGridWeek"
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleSelect}
            height="auto"
            allDaySlot={false}
          />
        </div>

        {/* Next bookings list */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5">
            <Calendar className="h-5 w-5 text-primary" />
            My Bookings Directory
          </h2>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredBookings.filter(b => b.booked_by === userId).length === 0 ? (
              <Card className="border-dashed border-border bg-slate-50/20">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  You have no scheduled bookings.
                </CardContent>
              </Card>
            ) : (
              filteredBookings
                .filter(b => b.booked_by === userId)
                .map((b) => (
                  <Card key={b.id} className="border-border shadow-sm">
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            {b.assets?.name}
                          </h3>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleCancelBooking(b.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> Location: {b.assets?.location || 'Unspecified'}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold">Purpose:</div>
                        <p className="text-foreground leading-normal font-medium bg-slate-50 p-2 rounded">
                          {b.purpose}
                        </p>
                      </div>

                      <div className="text-[10px] text-muted-foreground">
                        Time: {formatDateTime(b.start_time)} - {formatDateTime(b.end_time)}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
