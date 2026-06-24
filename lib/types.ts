export type ProjectCategory = 'quick' | 'short' | 'medium'
export type ProjectStatus = 'active' | 'done'
export type TaskStatus = 'not_started' | 'in_progress' | 'stuck' | 'done'

export interface Step {
  id: string
  project_id: string
  text: string
  completed: boolean
  position: number
}

export interface Project {
  id: string
  title: string
  category: ProjectCategory
  description: string | null
  inspiration: string | null
  expected_outcomes: string | null
  status: ProjectStatus
  started_at: string | null
  estimated_hours: number | null
  url: string | null
  what_was_possible: string | null
  what_was_not_possible: string | null
  what_you_learned: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  steps?: Step[]
}

export interface Task {
  id: string
  project_id: string
  title: string
  status: TaskStatus
  created_at: string
  started_at: string | null
  completed_at: string | null
  updated_at: string
}
