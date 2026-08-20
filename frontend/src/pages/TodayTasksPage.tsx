import { useState } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { TaskForm } from '../features/todo/components/TaskForm'
import { TaskList } from '../features/todo/components/TaskList'
import { useTasks } from '../features/todo/hooks/useTasks'
import type { CreateTaskRequest, Task } from '../features/todo/types'

export function TodayTasksPage() {
  const { user, logout } = useAuth()
  const { tasks, isLoading, error, add, update, remove, reorder } = useTasks()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null

  function handleSelect(id: number) {
    setSelectedTaskId((prev) => (prev === id ? null : id))
  }

  function openCreate() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function openEdit() {
    if (!selectedTask) return
    setEditingTask(selectedTask)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  async function handleSubmit(request: CreateTaskRequest) {
    if (editingTask) {
      await update(editingTask.id, request)
      setSelectedTaskId(null)
    } else {
      await add(request)
    }
  }

  async function handleDelete() {
    if (!selectedTaskId) return
    await remove(selectedTaskId)
    setSelectedTaskId(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, color: '#2d3748' }}>今日のタスク</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#718096' }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #cbd5e0',
              borderRadius: 6,
              background: '#fff',
              color: '#4a5568',
              cursor: 'pointer',
            }}
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* action bar */}
      {selectedTask && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            background: '#ebf8ff',
            borderBottom: '1px solid #bee3f8',
          }}
        >
          <span style={{ flex: 1, fontSize: 14, color: '#2b6cb0' }}>
            「{selectedTask.title}」を選択中
          </span>
          <button onClick={openEdit} style={actionButtonStyle('#3182ce', '#fff')}>
            編集
          </button>
          <button onClick={() => void handleDelete()} style={actionButtonStyle('#e53e3e', '#fff')}>
            削除
          </button>
        </div>
      )}

      {/* main */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        {isLoading && (
          <p style={{ color: '#a0aec0', textAlign: 'center' }}>読み込み中...</p>
        )}
        {error && (
          <div
            style={{
              background: '#fff5f5',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        {!isLoading && (
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelect={handleSelect}
            onReorder={(ids) => void reorder(ids)}
          />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openCreate}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#3182ce',
          color: '#fff',
          border: 'none',
          fontSize: 28,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(49,130,206,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ＋
      </button>

      {/* form modal */}
      {isFormOpen && (
        <TaskForm
          initial={editingTask ?? undefined}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  )
}

function actionButtonStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '6px 16px',
    fontSize: 13,
    border: 'none',
    borderRadius: 6,
    background: bg,
    color,
    cursor: 'pointer',
    fontWeight: 600,
  }
}
