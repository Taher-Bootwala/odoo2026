export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: import('../types/database').UserProfile
        Insert: Partial<import('../types/database').UserProfile>
        Update: Partial<import('../types/database').UserProfile>
      }
      departments: {
        Row: import('../types/database').Department
        Insert: Partial<import('../types/database').Department>
        Update: Partial<import('../types/database').Department>
      }
      categories: {
        Row: import('../types/database').Category
        Insert: Partial<import('../types/database').Category>
        Update: Partial<import('../types/database').Category>
      }
      assets: {
        Row: import('../types/database').Asset
        Insert: Partial<import('../types/database').Asset>
        Update: Partial<import('../types/database').Asset>
      }
      asset_allocations: {
        Row: import('../types/database').AssetAllocation
        Insert: Partial<import('../types/database').AssetAllocation>
        Update: Partial<import('../types/database').AssetAllocation>
      }
      asset_transfers: {
        Row: import('../types/database').AssetTransfer
        Insert: Partial<import('../types/database').AssetTransfer>
        Update: Partial<import('../types/database').AssetTransfer>
      }
      maintenance_requests: {
        Row: import('../types/database').MaintenanceRequest
        Insert: Partial<import('../types/database').MaintenanceRequest>
        Update: Partial<import('../types/database').MaintenanceRequest>
      }
      bookings: {
        Row: import('../types/database').Booking
        Insert: Partial<import('../types/database').Booking>
        Update: Partial<import('../types/database').Booking>
      }
      notifications: {
        Row: import('../types/database').Notification
        Insert: Partial<import('../types/database').Notification>
        Update: Partial<import('../types/database').Notification>
      }
      activity_logs: {
        Row: import('../types/database').ActivityLog
        Insert: Partial<import('../types/database').ActivityLog>
        Update: Partial<import('../types/database').ActivityLog>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: import('../types/database').UserRole
      asset_status: import('../types/database').AssetStatus
      asset_condition: import('../types/database').AssetCondition
      transfer_status: import('../types/database').TransferStatus
      maintenance_status: import('../types/database').MaintenanceStatus
      maintenance_priority: import('../types/database').MaintenancePriority
      booking_status: import('../types/database').BookingStatus
      resource_type: import('../types/database').ResourceType
      allocation_status: import('../types/database').AllocationStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
