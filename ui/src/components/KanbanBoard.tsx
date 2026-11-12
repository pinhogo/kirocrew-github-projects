import React, { useMemo } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { GitHubTask, StatusOption } from '../types'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: GitHubTask[]
  statusOptions: StatusOption[]
  columnCount: string
  activeColIndex: number
  onColIndexChange: (idx: number) => void
  onMoveStatus: (taskId: string, newStatus: string) => void
  onDelete: (taskId: string) => void
  onOpenCreate: (initialStatus?: string) => void
}

const STATUS_COLORS: Record<string, { bg: string; dot: string; border: string }> = {
  backlog: { bg: 'bg-zinc-500/10', dot: 'bg-zinc-400', border: 'border-zinc-500/20' },
  'to do': { bg: 'bg-amber-500/10', dot: 'bg-amber-500', border: 'border-amber-500/20' },
  todo: { bg: 'bg-amber-500/10', dot: 'bg-amber-500', border: 'border-amber-500/20' },
  'in progress': { bg: 'bg-blue-500/10', dot: 'bg-blue-500', border: 'border-blue-500/20' },
  execucao: { bg: 'bg-blue-500/10', dot: 'bg-blue-500', border: 'border-blue-500/20' },
  revisao: { bg: 'bg-purple-500/10', dot: 'bg-purple-500', border: 'border-purple-500/20' },
  review: { bg: 'bg-purple-500/10', dot: 'bg-purple-500', border: 'border-purple-500/20' },
  testes: { bg: 'bg-cyan-500/10', dot: 'bg-cyan-500', border: 'border-cyan-500/20' },
  done: { bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
  completed: { bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', border: 'border-emerald-500/20' },
  freeze: { bg: 'bg-slate-500/10', dot: 'bg-slate-400', border: 'border-slate-500/20' },
}

export function KanbanBoard({
  tasks,
  statusOptions,
  columnCount,
  activeColIndex,
  onColIndexChange,
  onMoveStatus,
  onDelete,
  onOpenCreate,
}: KanbanBoardProps) {
  // Group tasks by status option order
  const columns = useMemo(() => {
    const colMap = new Map<string, GitHubTask[]>()
    statusOptions.forEach((opt) => colMap.set(opt.name, []))

    tasks.forEach((task) => {
      const status = task.status || 'No Status'
      if (!colMap.has(status)) {
        colMap.set(status, [])
      }
      colMap.get(status)!.push(task)
    })

    return Array.from(colMap.entries()).map(([name, items]) => ({
      name,
      items,
      count: items.length,
    }))
  }, [tasks, statusOptions])

  // Slice visible columns based on selection
  const visibleColumns = useMemo(() => {
    if (columns.length === 0) return []
    if (columnCount === 'all') return columns
    const num = Math.max(1, parseInt(columnCount, 10) || 1)
    const startIndex = Math.min(activeColIndex, Math.max(0, columns.length - num))
    return columns.slice(startIndex, startIndex + num)
  }, [columns, columnCount, activeColIndex])

  const canGoPrev = activeColIndex > 0
  const canGoNext =
    columnCount !== 'all' &&
    activeColIndex + (parseInt(columnCount, 10) || 1) < columns.length

  const getColColor = (name: string) => {
    const lower = name.toLowerCase()
    for (const [key, val] of Object.entries(STATUS_COLORS)) {
      if (lower.includes(key)) return val
    }
    return { bg: 'bg-muted/10', dot: 'bg-muted', border: 'border-border' }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Column Navigator if in limited column view */}
      {columnCount !== 'all' && columns.length > 1 && (
        <div className="flex items-center justify-between px-1 select-none">
          <div className="flex items-center gap-1.5">
            <button
              disabled={!canGoPrev}
              onClick={() => onColIndexChange(Math.max(0, activeColIndex - 1))}
              className="p-1 rounded-md border border-border hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted hover:text-text transition-all"
              title="Coluna anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted font-medium">
              Coluna {activeColIndex + 1} de {columns.length}
            </span>
            <button
              disabled={!canGoNext}
              onClick={() => onColIndexChange(activeColIndex + 1)}
              className="p-1 rounded-md border border-border hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed text-muted hover:text-text transition-all"
              title="Próxima coluna"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick jump to column pills */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-[60%] py-0.5">
            {columns.map((c, i) => (
              <button
                key={c.name}
                onClick={() => onColIndexChange(i)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                  i === activeColIndex
                    ? 'bg-accent text-accent-text'
                    : 'bg-surface border border-border text-muted hover:text-text'
                }`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board Columns Horizontal Container */}
      <div className="flex items-start gap-3 flex-1 overflow-x-auto pb-4">
        {visibleColumns.map((col) => {
          const colorConfig = getColColor(col.name)
          const isSingleCol = columnCount === '1'

          return (
            <div
              key={col.name}
              className={`flex flex-col rounded-xl bg-surface/90 border ${colorConfig.border} overflow-hidden shadow-xs flex-shrink-0 transition-all ${
                isSingleCol ? 'w-full min-w-0' : 'w-[290px] sm:w-[320px]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-bg/50 select-none">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorConfig.dot}`} />
                  <span className="font-semibold text-xs tracking-tight uppercase truncate">
                    {col.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-border/80 text-[11px] font-bold text-muted">
                    {col.count}
                  </span>
                  <button
                    onClick={() => onOpenCreate(col.name)}
                    className="p-1 rounded text-muted hover:text-text hover:bg-border transition-colors"
                    title={`Adicionar tarefa em ${col.name}`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-2 p-2.5 max-h-[calc(100vh-250px)] min-h-[140px] overflow-y-auto">
                {col.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-muted text-xs border border-dashed border-border/80 rounded-lg text-center">
                    <span>Sem tarefas nesta coluna</span>
                    <button
                      onClick={() => onOpenCreate(col.name)}
                      className="mt-2 text-accent hover:underline text-[11px] font-medium"
                    >
                      + Criar tarefa aqui
                    </button>
                  </div>
                ) : (
                  col.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      statusOptions={statusOptions}
                      onMoveStatus={onMoveStatus}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
