import client from '../../api/client'
import type { Project, ProjectRecord, ProjectUpdate } from '../../types/projects.types'

export async function fetchProject(id: string): Promise<ProjectRecord> {
  const res = await client.get<ProjectRecord>(`/projects/${id}`)
  return res.data
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const res = await client.get<ProjectRecord[]>('/projects')
  return res.data
}

export async function createProject(data: Project): Promise<ProjectRecord> {
  const res = await client.post<ProjectRecord>('/projects', data)
  return res.data
}

export async function updateProject(projectId: string, updates: ProjectUpdate): Promise<ProjectRecord> {
  const res = await client.put<ProjectRecord>(`/projects/${projectId}`, updates)
  return res.data
}

export async function deleteProject(projectId: string): Promise<void> {
  await client.delete(`/projects/${projectId}`)
}
