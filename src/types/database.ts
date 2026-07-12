export type UserRole = 'admin' | 'asset_manager' | 'department_head' | 'employee';

export type AssetStatus = 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export type TransferStatus = 'requested' | 'dept_head_approved' | 'asset_manager_approved' | 'completed' | 'rejected';

export type MaintenanceStatus = 'pending' | 'approved' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type ResourceType = 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle';

export type AllocationStatus = 'active' | 'returned';

export interface Department {
  id: string;
  name: string;
  code: string;
  head_id: string | null;
  parent_department_id: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string; // references auth.users(id)
  full_name: string;
  email: string;
  phone: string | null;
  employee_id: string;
  department_id: string | null;
  role: UserRole;
  status: 'active' | 'inactive';
  joining_date: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  warranty_period_months: number | null;
  icon: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  asset_id: string;
  name: string;
  serial_number: string | null;
  category_id: string;
  purchase_date: string | null;
  purchase_cost: number | null;
  manufacturer: string | null;
  model: string | null;
  warranty_expiry: string | null;
  condition: AssetCondition;
  location: string | null;
  department_id: string | null;
  is_shared_resource: boolean;
  resource_type: ResourceType | null;
  image_url: string | null;
  description: string | null;
  status: AssetStatus;
  current_holder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetAllocation {
  id: string;
  asset_id: string;
  employee_id: string;
  department_id: string | null;
  allocated_by: string;
  allocated_at: string;
  expected_return_date: string | null;
  actual_return_date: string | null;
  purpose: string | null;
  remarks: string | null;
  return_condition: AssetCondition | null;
  return_remarks: string | null;
  damage_report: string | null;
  status: AllocationStatus;
  created_at: string;
  updated_at: string;
}

export interface AssetTransfer {
  id: string;
  asset_id: string;
  from_employee_id: string | null;
  to_employee_id: string | null;
  from_department_id: string | null;
  to_department_id: string | null;
  requested_by: string;
  dept_head_approved_by: string | null;
  asset_manager_approved_by: string | null;
  status: TransferStatus;
  reason: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  asset_id: string;
  reported_by: string;
  approved_by: string | null;
  technician: string | null;
  priority: MaintenancePriority;
  issue_description: string;
  resolution_notes: string | null;
  status: MaintenanceStatus;
  cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  resource_id: string;
  booked_by: string;
  start_time: string;
  end_time: string;
  purpose: string | null;
  status: BookingStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  link: string | null;
  related_id: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  description: string | null;
  metadata: any | null;
  created_at: string;
}
