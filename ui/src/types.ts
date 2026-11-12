export interface GitHubTask {
  id: string
  title: string
  status: string
  number?: number
  url?: string
  body?: string
  repository?: string
  type?: string
}

export interface StatusOption {
  id: string
  name: string
}

export interface StatusField {
  id: string
  name: string
  options: StatusOption[]
}

export interface ProjectInfo {
  id: string
  number: number
  title: string
  url?: string
  owner?: string
  status_fields: StatusField[]
}

export interface AvailableProject {
  id: string
  number: number
  title: string
  url?: string
  closed: boolean
  owner: string
}
