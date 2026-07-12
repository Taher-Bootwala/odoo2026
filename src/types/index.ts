import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export type UserRole = Enums<'user_role'>
export type AssetStatus = Enums<'asset_status'>
export type AssetCondition = Enums<'asset_condition'>
export type TransferStatus = Enums<'transfer_status'>
export type MaintenanceStatus = Enums<'maintenance_status'>
export type MaintenancePriority = Enums<'maintenance_priority'>
export type BookingStatus = Enums<'booking_status'>
export type ResourceType = Enums<'resource_type'>
export type AllocationStatus = Enums<'allocation_status'>

export type DbUser = Tables<'users'>
export type DbDepartment = Tables<'departments'>
export type DbCategory = Tables<'categories'>
export type DbAsset = Tables<'assets'>
export type DbAllocation = Tables<'asset_allocations'>
export type DbTransfer = Tables<'asset_transfers'>
export type DbMaintenance = Tables<'maintenance_requests'>
export type DbBooking = Tables<'bookings'>
export type DbNotification = Tables<'notifications'>
export type DbActivityLog = Tables<'activity_logs'>

// Extended UI interfaces
export interface UserProfile extends DbUser {
  department?: DbDepartment | null
}

export interface AssetWithCategory extends DbAsset {
  categories?: DbCategory | null
  current_holder?: DbUser | null
  department?: DbDepartment | null
}

export interface AllocationWithRelations extends DbAllocation {
  assets?: { name: string; asset_id: string } | null
  users?: { full_name: string; email: string } | null
}

export interface TransferWithRelations extends DbTransfer {
  assets?: { name: string; asset_id: string } | null
  from_employee?: { full_name: string } | null
  to_employee?: { full_name: string } | null
  from_department?: { name: string } | null
  to_department?: { name: string } | null
}

export interface MaintenanceWithRelations extends DbMaintenance {
  assets?: { name: string; asset_id: string } | null
  reported_by_user?: { full_name: string } | null
}

export interface BookingWithRelations extends DbBooking {
  assets?: { name: string; asset_id: string; location: string | null } | null
  booked_by_user?: { full_name: string } | null
}
