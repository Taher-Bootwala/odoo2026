export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          employee_id: string
          department_id: string | null
          role: 'admin' | 'asset_manager' | 'department_head' | 'employee'
          status: 'active' | 'inactive'
          joining_date: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          employee_id?: string
          department_id?: string | null
          role?: 'admin' | 'asset_manager' | 'department_head' | 'employee'
          status?: 'active' | 'inactive'
          joining_date?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          employee_id?: string
          department_id?: string | null
          role?: 'admin' | 'asset_manager' | 'department_head' | 'employee'
          status?: 'active' | 'inactive'
          joining_date?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          head_id: string | null
          parent_department_id: string | null
          description: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          head_id?: string | null
          parent_department_id?: string | null
          description?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          head_id?: string | null
          parent_department_id?: string | null
          description?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          warranty_period_months: number | null
          icon: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          warranty_period_months?: number | null
          icon?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          warranty_period_months?: number | null
          icon?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          asset_id: string
          name: string
          serial_number: string | null
          category_id: string
          purchase_date: string | null
          purchase_cost: number | null
          manufacturer: string | null
          model: string | null
          warranty_expiry: string | null
          condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
          location: string | null
          department_id: string | null
          is_shared_resource: boolean
          resource_type: 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle' | null
          image_url: string | null
          description: string | null
          status: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed'
          current_holder_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id?: string
          name: string
          serial_number?: string | null
          category_id: string
          purchase_date?: string | null
          purchase_cost?: number | null
          manufacturer?: string | null
          model?: string | null
          warranty_expiry?: string | null
          condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
          location?: string | null
          department_id?: string | null
          is_shared_resource?: boolean
          resource_type?: 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle' | null
          image_url?: string | null
          description?: string | null
          status?: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed'
          current_holder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          name?: string
          serial_number?: string | null
          category_id?: string
          purchase_date?: string | null
          purchase_cost?: number | null
          manufacturer?: string | null
          model?: string | null
          warranty_expiry?: string | null
          condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
          location?: string | null
          department_id?: string | null
          is_shared_resource?: boolean
          resource_type?: 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle' | null
          image_url?: string | null
          description?: string | null
          status?: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed'
          current_holder_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_allocations: {
        Row: {
          id: string
          asset_id: string
          employee_id: string
          department_id: string | null
          allocated_by: string
          allocated_at: string
          expected_return_date: string | null
          actual_return_date: string | null
          purpose: string | null
          remarks: string | null
          return_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | null
          return_remarks: string | null
          damage_report: string | null
          status: 'active' | 'returned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          employee_id: string
          department_id?: string | null
          allocated_by: string
          allocated_at?: string
          expected_return_date?: string | null
          actual_return_date?: string | null
          purpose?: string | null
          remarks?: string | null
          return_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | null
          return_remarks?: string | null
          damage_report?: string | null
          status?: 'active' | 'returned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          employee_id?: string
          department_id?: string | null
          allocated_by?: string
          allocated_at?: string
          expected_return_date?: string | null
          actual_return_date?: string | null
          purpose?: string | null
          remarks?: string | null
          return_condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | null
          return_remarks?: string | null
          damage_report?: string | null
          status?: 'active' | 'returned'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_transfers: {
        Row: {
          id: string
          asset_id: string
          from_employee_id: string | null
          to_employee_id: string | null
          from_department_id: string | null
          to_department_id: string | null
          requested_by: string
          dept_head_approved_by: string | null
          asset_manager_approved_by: string | null
          status: 'requested' | 'dept_head_approved' | 'asset_manager_approved' | 'completed' | 'rejected'
          reason: string | null
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          from_employee_id?: string | null
          to_employee_id?: string | null
          from_department_id?: string | null
          to_department_id?: string | null
          requested_by: string
          dept_head_approved_by?: string | null
          asset_manager_approved_by?: string | null
          status?: 'requested' | 'dept_head_approved' | 'asset_manager_approved' | 'completed' | 'rejected'
          reason?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          from_employee_id?: string | null
          to_employee_id?: string | null
          from_department_id?: string | null
          to_department_id?: string | null
          requested_by?: string
          dept_head_approved_by?: string | null
          asset_manager_approved_by?: string | null
          status?: 'requested' | 'dept_head_approved' | 'asset_manager_approved' | 'completed' | 'rejected'
          reason?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          id: string
          asset_id: string
          reported_by: string
          approved_by: string | null
          technician: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          issue_description: string
          resolution_notes: string | null
          status: 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          reported_by: string
          approved_by?: string | null
          technician?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          issue_description: string
          resolution_notes?: string | null
          status?: 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          reported_by?: string
          approved_by?: string | null
          technician?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          issue_description?: string
          resolution_notes?: string | null
          status?: 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          resource_id: string
          booked_by: string
          start_time: string
          end_time: string
          purpose: string | null
          status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          booked_by: string
          start_time: string
          end_time: string
          purpose?: string | null
          status?: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          booked_by?: string
          start_time?: string
          end_time?: string
          purpose?: string | null
          status?: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string | null
          read: boolean
          link: string | null
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string | null
          read?: boolean
          link?: string | null
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string | null
          read?: boolean
          link?: string | null
          related_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          module: string
          description: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          module: string
          description?: string | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          module?: string
          description?: string | null
          metadata?: any | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'asset_manager' | 'department_head' | 'employee'
      asset_status: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed'
      asset_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
      transfer_status: 'requested' | 'dept_head_approved' | 'asset_manager_approved' | 'completed' | 'rejected'
      maintenance_status: 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
      maintenance_priority: 'low' | 'medium' | 'high' | 'critical'
      booking_status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
      resource_type: 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle'
      allocation_status: 'active' | 'returned'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
