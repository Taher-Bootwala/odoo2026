import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    allocated: 'bg-blue-50 text-blue-700 border-blue-200',
    reserved: 'bg-purple-50 text-purple-700 border-purple-200',
    under_maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    retired: 'bg-gray-50 text-gray-600 border-gray-200',
    disposed: 'bg-gray-100 text-gray-500 border-gray-300',
    // Allocation statuses
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-gray-50 text-gray-600 border-gray-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
    // Transfer statuses
    requested: 'bg-amber-50 text-amber-700 border-amber-200',
    dept_head_approved: 'bg-blue-50 text-blue-700 border-blue-200',
    asset_manager_approved: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    // Maintenance statuses
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    assigned: 'bg-purple-50 text-purple-700 border-purple-200',
    in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-gray-50 text-gray-600 border-gray-200',
    // Booking statuses
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }
  return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200'
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-50 text-red-700 border-red-200',
    asset_manager: 'bg-purple-50 text-purple-700 border-purple-200',
    department_head: 'bg-blue-50 text-blue-700 border-blue-200',
    employee: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return colors[role] || 'bg-gray-50 text-gray-600 border-gray-200'
}

export function formatRole(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    asset_manager: 'Asset Manager',
    department_head: 'Dept. Head',
    employee: 'Employee',
  }
  return labels[role] || role
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
