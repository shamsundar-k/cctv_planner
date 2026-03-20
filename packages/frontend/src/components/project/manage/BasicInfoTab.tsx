import { useState, useEffect } from 'react'
import type { Project, UpdateProjectDTO } from '../../../api/projects'
import { useUpdateProject } from '../../../api/projects'
import { useToast } from '../../ui/Toast'

interface BasicInfoTabProps {
  project: Project
}

export default function BasicInfoTab({ project }: BasicInfoTabProps) {
  const showToast = useToast()
  const updateProject = useUpdateProject()

  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)

  useEffect(() => {
    setName(project.name)
    setDescription(project.description)
  }, [project.name, project.description])

  const isDirty = name !== project.name || description !== project.description

  async function handleSave() {
    if (!name.trim()) return
    const updates: UpdateProjectDTO = {}
    if (name !== project.name) updates.name = name.trim()
    if (description !== project.description) updates.description = description
    try {
      await updateProject.mutateAsync({ projectId: project.id, updates })
      showToast('Project info saved', 'success')
    } catch {
      showToast('Failed to save project info', 'error')
    }
  }

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300" htmlFor="proj-name">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="proj-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 px-3 text-sm rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          placeholder="Project name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300" htmlFor="proj-desc">
          Description
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="px-3 py-2 text-sm rounded-md bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors resize-y"
          placeholder="Optional project description"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || !name.trim() || updateProject.isPending}
        className="self-start px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updateProject.isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
