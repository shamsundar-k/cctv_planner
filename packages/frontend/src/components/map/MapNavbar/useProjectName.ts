import { useState, useRef, useEffect } from 'react'
import { useUpdateProject } from '../../../api/projects'
import { useToast } from '../../ui/Toast'

interface UseProjectNameReturn {
  displayName: string
  draftName: string
  setDraftName: (name: string) => void
  isEditing: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  startEditing: () => void
  commitEdit: () => Promise<void>
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function useProjectName(projectId: string, projectName: string): UseProjectNameReturn {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(projectName)
  const [draftName, setDraftName] = useState(projectName)

  const inputRef = useRef<HTMLInputElement>(null)
  const escapeRef = useRef(false)

  const updateProject = useUpdateProject()
  const showToast = useToast()

  // Keep displayName in sync with server-fetched projectName (but not while editing)
  useEffect(() => {
    if (!isEditing) setDisplayName(projectName)
  }, [projectName, isEditing])

  // Focus + select all when edit mode starts
  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  function startEditing() {
    setDraftName(displayName)
    escapeRef.current = false
    setIsEditing(true)
  }

  async function commitEdit() {
    if (escapeRef.current) {
      setIsEditing(false)
      return
    }
    const trimmed = draftName.trim()
    if (!trimmed || trimmed.length > 100) {
      showToast('Project name must be 1–100 characters.', 'error')
      setIsEditing(false)
      return
    }
    if (trimmed === displayName) {
      setIsEditing(false)
      return
    }
    try {
      await updateProject.mutateAsync({ projectId, updates: { name: trimmed } })
      setDisplayName(trimmed)
      setIsEditing(false)
    } catch {
      showToast('Failed to update project name.', 'error')
      setIsEditing(false)
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      escapeRef.current = true
      inputRef.current?.blur()
    }
  }

  return {
    displayName,
    draftName,
    setDraftName,
    isEditing,
    inputRef,
    startEditing,
    commitEdit,
    handleInputKeyDown,
  }
}
