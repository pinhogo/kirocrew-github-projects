import React from 'react'
import { CheckCircle2, Circle, ExternalLink, Trash2 } from 'lucide-react'
import { GitHubTask, StatusOption } from '../types'
import { findDoneStatusName, isDoneStatus } from '../utils/status'
import { decodeUnicodeEscapes } from '../utils/unicode'

interface TableViewProps {
  tasks: GitHubTask[]
  statusOptions: StatusOption[]
  onMoveStatus: (taskId: string, newStatus: string) => void
  onDelete: (taskId: string) => void
}

export function TableView({ tasks, statusOptions, onMoveStatus, onDelete }: TableViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted text-xs border border-dashed border-border rounded-xl">
        Nenhuma tarefa encontrada com os filtros atuais.
      </div>
    )
  }

  const doneTarget = findDoneStatusName(statusOptions)

  return (
    <div className="w-full bg-surface border border-border rounded-xl overflow-hidden shadow-xs text-xs flex flex-col max-h-[calc(100vh-170px)]">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface border-b border-border z-10">
            <tr className="text-muted font-semibold select-none bg-bg/80">
              <th className="p-3 w-1/2">Título</th>
              <th className="p-3 w-48">Status</th>
              <th className="p-3 w-40">Repositório</th>
              <th className="p-3 text-right w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {tasks.map((task) => {
              const isDone = isDoneStatus(task.status)
              return (
                <tr key={task.id} className="hover:bg-bg/40 transition-colors group">
                  {/* Title & Link */}
                  <td className="p-3 font-medium text-text">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={15} className="text-muted shrink-0" />
                      )}
                      <span className="font-semibold text-xs leading-relaxed">{decodeUnicodeEscapes(task.title)}</span>
                      {task.number && (
                        <span className="font-mono text-[10px] text-muted shrink-0">#{task.number}</span>
                      )}
                      {task.url && (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-text p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Abrir no GitHub"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3">
                    <select
                      value={task.status}
                      onChange={(e) => onMoveStatus(task.id, e.target.value)}
                      className="bg-bg border border-border rounded-lg px-2 py-1 text-[11px] text-text font-medium focus:outline-none focus:border-accent cursor-pointer max-w-[180px] truncate"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Repository */}
                  <td className="p-3 text-muted">
                    {task.repository ? (
                      <span className="font-mono text-[11px] truncate block max-w-[160px]">{task.repository}</span>
                    ) : (
                      <span className="text-muted/50">-</span>
                    )}
                  </td>

                  {/* Actions: Done & Delete */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isDone && (
                        <button
                          onClick={() => onMoveStatus(task.id, doneTarget)}
                          className="px-2.5 py-1 bg-surface border border-border hover:bg-border text-text rounded-md text-[11px] font-medium transition-all"
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir a tarefa "${decodeUnicodeEscapes(task.title)}"?`)) {
                            onDelete(task.id)
                          }
                        }}
                        className="p-1 rounded text-muted hover:text-red-400 hover:bg-border transition-all"
                        title="Excluir tarefa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
