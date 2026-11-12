import React, { useState } from 'react'
import { CheckCircle2, ExternalLink, Trash2, ArrowRight } from 'lucide-react'
import { GitHubTask, StatusOption } from '../types'
import { findDoneStatusName, isDoneStatus } from '../utils/status'
import { decodeUnicodeEscapes } from '../utils/unicode'

interface TaskCardProps {
  task: GitHubTask
  statusOptions: StatusOption[]
  onMoveStatus: (taskId: string, newStatus: string) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, statusOptions, onMoveStatus, onDelete }: TaskCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const isDone = isDoneStatus(task.status)
  const doneTarget = findDoneStatusName(statusOptions)

  return (
    <div className="group relative flex flex-col gap-2 p-3 rounded-lg bg-bg border border-border hover:border-border-strong hover:shadow-md transition-all">
      {/* Title & External Link */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold leading-snug line-clamp-2 text-text">
          {decodeUnicodeEscapes(task.title)}
        </span>
        {task.url && (
          <a
            href={task.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0"
            title="Abrir no GitHub"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Meta Information: #number, Repo, Type */}
      <div className="flex items-center justify-between text-[11px] text-muted pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.number ? (
            <span className="font-mono text-muted/80">#{task.number}</span>
          ) : (
            <span className="text-[10px] bg-border px-1.5 py-0.2 rounded font-mono font-medium">
              DRAFT
            </span>
          )}
          {task.repository && (
            <span className="text-muted/60 text-[10px] truncate max-w-[130px]">
              {task.repository}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Status Mover Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1 rounded hover:bg-border text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all"
              title="Mover para outro status"
            >
              <ArrowRight size={13} />
            </button>
            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 z-40 min-w-[180px] bg-surface border border-border rounded-lg shadow-xl py-1 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider border-b border-border/50">
                    Mover tarefa para:
                  </div>
                  <div className="max-h-48 overflow-y-auto py-0.5">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setShowStatusMenu(false)
                          if (opt.name !== task.status) {
                            onMoveStatus(task.id, opt.name)
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 hover:bg-border transition-colors truncate ${
                          opt.name === task.status ? 'text-accent font-semibold' : 'text-text'
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mark as Done */}
          {!isDone && (
            <button
              onClick={() => onMoveStatus(task.id, doneTarget)}
              title="Concluir tarefa (Done)"
              className="opacity-0 group-hover:opacity-100 hover:text-emerald-400 text-muted transition-all p-1"
            >
              <CheckCircle2 size={13} />
            </button>
          )}

          {/* Delete Action */}
          <button
            onClick={() => {
              if (window.confirm(`Deseja realmente excluir a tarefa "${decodeUnicodeEscapes(task.title)}"?`)) {
                onDelete(task.id)
              }
            }}
            title="Excluir do projeto"
            className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-muted transition-all p-1"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
