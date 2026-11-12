import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FolderGit2,
  RefreshCw,
  Search,
  Columns,
  Plus,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { useAppApi } from '@kirocrew/app-sdk'
import { GitHubTask, StatusOption, AvailableProject } from './types'
import { KanbanBoard } from './components/KanbanBoard'
import { TableView } from './components/TableView'
import { CreateTaskModal } from './components/CreateTaskModal'
import { SkeletonLoader } from './components/SkeletonLoader'

const DEFAULT_OWNER = ''
const DEFAULT_PROJECT_NUMBER = 0

// Fallback status order
const KNOWN_STATUS_ORDER = [
  'backlog',
  'to do',
  'todo',
  '1. execução de tasks',
  'in progress',
  '2. correção e revisão de código',
  'review',
  '3. testes, playground e documentação',
  'done',
  'completed',
  'freeze',
]

export default function App() {
  const api = useAppApi()

  // Configuration & Navigation with LocalStorage Persistence
  const [owner, setOwner] = useState(() => {
    try {
      return localStorage.getItem('kiro_gh_owner') || DEFAULT_OWNER
    } catch {
      return DEFAULT_OWNER
    }
  })

  const [projectNumber, setProjectNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kiro_gh_project_num')
      const num = saved ? parseInt(saved, 10) : DEFAULT_PROJECT_NUMBER
      return Number.isFinite(num) && num > 0 ? num : DEFAULT_PROJECT_NUMBER
    } catch {
      return DEFAULT_PROJECT_NUMBER
    }
  })

  const [subView, setSubView] = useState<'board' | 'table'>(() => {
    try {
      return (localStorage.getItem('kiro_gh_subview') as 'board' | 'table') || 'board'
    } catch {
      return 'board'
    }
  })

  const [columnCount, setColumnCount] = useState<string>(() => {
    try {
      return localStorage.getItem('kiro_gh_col_count') || 'all'
    } catch {
      return 'all'
    }
  })

  const [activeColIndex, setActiveColIndex] = useState<number>(0)
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Data states
  const [tasks, setTasks] = useState<GitHubTask[]>([])
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([])
  const [projectTitle, setProjectTitle] = useState('GitHub Projects')
  const [projectUrl, setProjectUrl] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createInitialStatus, setCreateInitialStatus] = useState<string | undefined>()

  // Persistence helpers
  const handleSelectProject = (num: number) => {
    setProjectNumber(num)
    try {
      localStorage.setItem('kiro_gh_project_num', String(num))
    } catch {}
    const proj = availableProjects.find((p) => p.number === num)
    if (proj) setProjectTitle(proj.title)
  }

  const handleSelectSubView = (view: 'board' | 'table') => {
    setSubView(view)
    try {
      localStorage.setItem('kiro_gh_subview', view)
    } catch {}
  }

  const handleSelectColumnCount = (count: string) => {
    setColumnCount(count)
    try {
      localStorage.setItem('kiro_gh_col_count', count)
    } catch {}
  }

  const [debouncedOwner, setDebouncedOwner] = useState(owner)
  useEffect(() => {
    const trimmed = owner.trim()
    if (!trimmed) {
      setDebouncedOwner('')
      return
    }
    const timer = setTimeout(() => {
      setDebouncedOwner(trimmed)
      try {
        localStorage.setItem('kiro_gh_owner', trimmed)
      } catch {}
    }, 350)
    return () => clearTimeout(timer)
  }, [owner])

  // Load available projects
  const fetchProjects = useCallback(async () => {
    try {
      const res: any = await api.get(`/apps/github-projects/api/projects?owner=${encodeURIComponent(debouncedOwner)}`)
      if (res && res.ok && Array.isArray(res.projects)) {
        setAvailableProjects(res.projects)
        if (!debouncedOwner && res?.owner) {
          setOwner(res.owner)
          setDebouncedOwner(res.owner)
          try {
            localStorage.setItem('kiro_gh_owner', res.owner)
          } catch {}
        }
        const current = res.projects.find((p: any) => p.number === projectNumber)
        if (current) {
          setProjectTitle(current.title)
          if (current.url) setProjectUrl(current.url)
        } else {
          const preferred = res.projects[0]
          if (preferred) {
            setProjectNumber(preferred.number)
            setProjectTitle(preferred.title)
            if (preferred.url) setProjectUrl(preferred.url)
          } else {
            setProjectUrl('')
            setProjectTitle('Nenhum projeto encontrado')
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao listar projetos disponíveis:', err)
    }
  }, [api, debouncedOwner, projectNumber])

  // Load project tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await api.post('/apps/github-projects/api/tasks', {
        owner: debouncedOwner,
        project_number: projectNumber,
        limit: 300,
      })

      if (res && res.ok && Array.isArray(res.tasks)) {
        if (!debouncedOwner && res?.owner) {
          setOwner(res.owner)
          setDebouncedOwner(res.owner)
          try {
            localStorage.setItem('kiro_gh_owner', res.owner)
          } catch {}
        }
        setTasks(res.tasks)
        if (res.project) {
          if (res.project.title) setProjectTitle(res.project.title)
          if (res.project.url) setProjectUrl(res.project.url)
          if (projectNumber <= 0 && res.project.number) {
            setProjectNumber(res.project.number)
          }
          // Extrai opções do primeiro campo Status encontrado
          const sf = res.project.status_fields?.find(
            (f: any) => f.name.toLowerCase() === 'status' || f.options?.length > 0
          )
          if (sf && Array.isArray(sf.options) && sf.options.length > 0) {
            setStatusOptions(sf.options)
          }
        } else {
          setStatusOptions([])
        }
      } else {
        setError(res?.error || 'Nenhuma tarefa encontrada.')
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao conectar com o backend do GitHub Projects.')
    } finally {
      setLoading(false)
    }
  }, [api, debouncedOwner, projectNumber])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Ensure status options fallback if empty
  const resolvedStatusOptions = useMemo(() => {
    if (statusOptions.length > 0) return statusOptions

    // Derive from loaded tasks
    const set = new Set<string>()
    tasks.forEach((t) => {
      if (t.status) set.add(t.status)
    })
    const list = Array.from(set).map((name) => ({ id: name, name }))
    list.sort((a, b) => {
      const aLower = a.name.toLowerCase()
      const bLower = b.name.toLowerCase()
      const aIdx = KNOWN_STATUS_ORDER.findIndex((k) => aLower.includes(k))
      const bIdx = KNOWN_STATUS_ORDER.findIndex((k) => bLower.includes(k))
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
      if (aIdx !== -1) return -1
      if (bIdx !== -1) return 1
      return a.name.localeCompare(b.name)
    })
    return list.length > 0
      ? list
      : [
          { id: 'todo', name: 'Todo' },
          { id: 'in_progress', name: 'In Progress' },
          { id: 'done', name: 'Done' },
        ]
  }, [statusOptions, tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const q = searchQuery.toLowerCase()
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.number && String(t.number).includes(q)) ||
        (t.repository && t.repository.toLowerCase().includes(q)) ||
        (t.status && t.status.toLowerCase().includes(q))
    )
  }, [tasks, searchQuery])

  // Move task status
  const handleMoveStatus = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks]
    // Otimista
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      await api.post('/apps/github-projects/api/task/update-status', {
        owner,
        project_number: projectNumber,
        item_id: taskId,
        status: newStatus,
      })
    } catch (err: any) {
      alert(`Falha ao mover tarefa: ${err?.message || err}`)
      setTasks(previousTasks) // Reverte
    }
  }

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const previousTasks = [...tasks]
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      await api.post('/apps/github-projects/api/task/delete', {
        owner,
        project_number: projectNumber,
        item_id: taskId,
      })
    } catch (err: any) {
      alert(`Falha ao excluir tarefa: ${err?.message || err}`)
      setTasks(previousTasks) // Reverte
    }
  }

  // Create task
  const handleCreateTask = async (title: string, body: string, status: string) => {
    await api.post('/apps/github-projects/api/task/create', {
      owner,
      project_number: projectNumber,
      title,
      body,
      status,
    })
    await fetchTasks()
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface text-text select-none overflow-hidden">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-bg/70 px-4 py-2.5 text-xs min-h-[52px]">
        {/* Left: App Logo, Project Selector & Counter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <FolderGit2 size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight text-text">GitHub Projects</span>
          </div>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          {/* Project dropdown */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            {availableProjects.length > 0 ? (
              <select
                id="project-selector"
                value={projectNumber}
                onChange={(e) => handleSelectProject(parseInt(e.target.value, 10))}
                className="bg-transparent border-none text-text font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {availableProjects.map((p) => (
                  <option key={p.id || p.number} value={p.number}>
                    {p.owner} / {p.title} #{p.number}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="bg-transparent border-none w-16 text-text font-semibold focus:outline-none"
                  title="Owner"
                />
                <span className="text-muted">/</span>
                <span className="font-semibold text-text truncate max-w-[140px]">
                  {projectTitle}
                </span>
                <span className="text-muted">#</span>
                <input
                  type="number"
                  value={projectNumber}
                  onChange={(e) => handleSelectProject(parseInt(e.target.value, 10) || 1)}
                  className="bg-transparent border-none w-8 text-muted focus:outline-none"
                  title="Número do projeto"
                />
              </>
            )}

            {/* Total Task Count Badge */}
            <span className="px-2 py-0.5 rounded-md bg-border text-[11px] font-bold text-muted ml-1" title="Total de tarefas no projeto">
              {tasks.length}
            </span>

            {(projectUrl || (owner && projectNumber > 0)) && (
              <a
                href={projectUrl || `https://github.com/users/${owner}/projects/${projectNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-text p-0.5 ml-0.5"
                title="Abrir projeto no GitHub"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* View switcher: BOARD vs TABELA */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-bg/50 shadow-2xs">
            <button
              onClick={() => handleSelectSubView('board')}
              className={`px-3 py-1 font-semibold transition-all ${
                subView === 'board'
                  ? 'bg-border text-text shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              BOARD
            </button>
            <button
              onClick={() => handleSelectSubView('table')}
              className={`px-3 py-1 font-semibold transition-all ${
                subView === 'table'
                  ? 'bg-border text-text shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              TABELA issue
            </button>
          </div>
        </div>

        {/* Right: Search, Columns, Nova Task, Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Busca de tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg border border-border rounded-lg pl-7 pr-2.5 py-1 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent w-36 sm:w-48 transition-all"
            />
          </div>

          {/* Column Count Selector (for Board view) */}
          {subView === 'board' && (
            <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2 py-0.5 shadow-2xs">
              <Columns size={12} className="text-muted" />
              <select
                id="column-count-selector"
                value={columnCount}
                onChange={(e) => handleSelectColumnCount(e.target.value)}
                className="bg-transparent text-xs text-text border-none focus:outline-none cursor-pointer pr-1"
                title="Colunas visíveis simultâneas"
              >
                <option value="1">1 Coluna</option>
                <option value="2">2 Colunas</option>
                <option value="3">3 Colunas</option>
                <option value="4">4 Colunas</option>
                <option value="all">Todas</option>
              </select>
            </div>
          )}

          {/* New Task Button */}
          <button
            onClick={() => {
              setCreateInitialStatus(undefined)
              setIsCreateOpen(true)
            }}
            className="flex items-center gap-1.5 bg-accent text-accent-text hover:opacity-90 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Plus size={13} />
            <span>Nova Task</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-muted hover:text-text transition-all"
            title="Atualizar tarefas"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-accent' : ''} />
          </button>
        </div>
      </header>

      {/* Main Board / Table Area */}
      <main className="flex-1 overflow-x-auto overflow-y-auto p-4 bg-bg/40 min-h-0">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs mb-4">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {loading && tasks.length === 0 ? (
          <SkeletonLoader count={columnCount === '1' ? 1 : 4} />
        ) : subView === 'table' ? (
          <TableView
            tasks={filteredTasks}
            statusOptions={resolvedStatusOptions}
            onMoveStatus={handleMoveStatus}
            onDelete={handleDeleteTask}
          />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            statusOptions={resolvedStatusOptions}
            columnCount={columnCount}
            activeColIndex={activeColIndex}
            onColIndexChange={setActiveColIndex}
            onMoveStatus={handleMoveStatus}
            onDelete={handleDeleteTask}
            onOpenCreate={(colName) => {
              setCreateInitialStatus(colName)
              setIsCreateOpen(true)
            }}
          />
        )}
      </main>

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        statusOptions={resolvedStatusOptions}
        initialStatus={createInitialStatus}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}
