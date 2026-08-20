export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Task {
  id: number
  type: string
  title: string
  timeSlot: TimeSlot | null
  dueDate: string
  dueTimeSlot: TimeSlot | null
  priority: Priority
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  type: string
  title: string
  timeSlot: TimeSlot | null
  dueDate: string
  dueTimeSlot: TimeSlot | null
  priority: Priority
}

export type UpdateTaskRequest = CreateTaskRequest

export interface ReorderTasksRequest {
  orderedTaskIds: number[]
}

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  MORNING: '朝',
  AFTERNOON: '昼',
  EVENING: '夕',
  NIGHT: '夜',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: '#e53e3e',
  MEDIUM: '#dd6b20',
  LOW: '#38a169',
}
