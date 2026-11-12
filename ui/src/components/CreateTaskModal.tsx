import React, { useState, useEffect } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { StatusOption } from '../types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  statusOptions: StatusOption[]
  initialStatus?: string
  onSubmit: (title: string, body: string, status: string) => Promise<void>
}

export function CreateTaskModal({
  isOpen,
  onClose,
  statusOptions,
  initialStatus,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState(initialStatus || (statusOptions[0]?.name ?? 'Todo'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus)
    } else if (statusOptions.length > 0) {
      const defaultCol = statusOptions.find(o => o.name.toLowerCase().includes('to do') || o.name.toLowerCase().includes('todo')) || statusOptions[0]
      setStatus(defaultCol.name)
    }
  }, [initialStatus, statusOptions])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)
    try {
      await onSubmit(title.trim(), body.trim(), status)
      setTitle('')
      setBody('')
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar tarefa no GitHub Projects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg/80">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-accent" />
            <span className="font-semibold text-sm text-text">Nova Tarefa no GitHub Project</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 p-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-muted">Título da Tarefa *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: [FEAT-101] Implementar filtro por milestone"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-muted">Descrição (opcional)</label>
            <textarea
              rows={3}
              placeholder="Critérios de aceitação, contexto ou detalhes da task..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-bg border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-accent resize-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-muted">Coluna / Status Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-bg border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.id} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-border text-muted hover:text-text hover:bg-surface font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-accent-text hover:opacity-90 font-medium transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? 'Criando...' : 'Criar Tarefa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
