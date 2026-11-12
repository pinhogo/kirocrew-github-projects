import { StatusOption } from '../types'

const DONE_STATUS_NAMES = ['done', 'completed', 'concluído', 'concluido', 'closed']

export function isDoneStatus(status?: string): boolean {
  if (!status) return false
  return DONE_STATUS_NAMES.includes(status.trim().toLowerCase())
}

export function findDoneStatusName(statusOptions: StatusOption[]): string {
  const match = statusOptions.find((opt) => isDoneStatus(opt.name))
  return match?.name || 'Done'
}
