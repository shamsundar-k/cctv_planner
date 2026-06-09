import client from '../../api/client'
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../../types/projects.types'

export async function fetchProject(id: string): Promise<Project> {
  const res = await client.get<Project>(`/projects/${id}`)
  return res.data
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await client.get<Project[]>('/projects')
  return res.data
}

export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const res = await client.post<Project>('/projects', data)
  return res.data
}

export async function updateProject(projectId: string, updates: UpdateProjectDTO): Promise<Project> {
  const res = await client.put<Project>(`/projects/${projectId}`, updates)
  return res.data
}

export async function deleteProject(projectId: string): Promise<void> {
  await client.delete(`/projects/${projectId}`)
}
