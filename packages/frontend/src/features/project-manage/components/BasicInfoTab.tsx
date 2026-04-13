/*
 * FILE SUMMARY — src/features/project-manage/components/BasicInfoTab.tsx
 *
 * "Basic Info" tab in the Project Settings page. Allows editing the project
 * name and description.
 *
 * BasicInfoTab({ project }) — Renders a simple form with:
 *   - A required "Name" text input, initially populated from `project.name`.
 *   - An optional "Description" textarea, initially populated from
 *     `project.description`.
 *   - A "Save Changes" button that is disabled when there are no unsaved
 *     changes (`isDirty` is false), the name is empty, or a save is in
 *     progress.
 *
 * handleSave() — Builds an UpdateProjectDTO containing only the changed
 *   fields, then calls the useUpdateProject mutation. Shows a success or error
 *   toast via useToast().
 *
 * The form state is re-synchronised from `project` props whenever the server
 * data changes (useEffect on project.name / project.description), so it
 * reflects any externally updated values.
 */
import { useState, useEffect } from 'react'
import type { Project, UpdateProjectDTO } from '../../../api/projects.types'
import { useUpdateProject } from '../../../api/projects'
import { useToast } from '../../../components/ui/Toast'

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
        <label className="text-sm font-medium text-primary/80" htmlFor="proj-name">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="proj-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 px-3 text-sm rounded-md bg-surface/10 border border-surface/30 text-primary placeholder-muted/50 outline-none focus:border-accent transition-colors"
          placeholder="Project name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary/80" htmlFor="proj-desc">
          Description
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="px-3 py-2 text-sm rounded-md bg-surface/10 border border-surface/30 text-primary placeholder-muted/50 outline-none focus:border-accent transition-colors resize-y"
          placeholder="Optional project description"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || !name.trim() || updateProject.isPending}
        className="self-start px-5 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-on-accent rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {updateProject.isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
