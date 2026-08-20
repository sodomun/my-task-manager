import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { createTask, deleteTask, fetchTasks, reorderTasks, updateTask } from '../services/taskService'
import type { CreateTaskRequest, Task, UpdateTaskRequest } from '../types'

export function useTasks() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTasks(token)
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const add = useCallback(
    async (request: CreateTaskRequest) => {
      if (!token) return
      const newTask = await createTask(token, request)
      setTasks((prev) => [...prev, newTask])
    },
    [token],
  )

  const update = useCallback(
    async (taskId: number, request: UpdateTaskRequest) => {
      if (!token) return
      const updated = await updateTask(token, taskId, request)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    },
    [token],
  )

  const remove = useCallback(
    async (taskId: number) => {
      if (!token) return
      await deleteTask(token, taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    },
    [token],
  )

  const reorder = useCallback(
    async (orderedIds: number[]) => {
      if (!token) return
      setTasks((prev) => {
        const map = new Map(prev.map((t) => [t.id, t]))
        return orderedIds.map((id, i) => ({ ...map.get(id)!, sortOrder: i }))
      })
      await reorderTasks(token, { orderedTaskIds: orderedIds })
    },
    [token],
  )

  return { tasks, isLoading, error, add, update, remove, reorder }
}
