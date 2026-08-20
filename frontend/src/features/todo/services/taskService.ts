import { API_BASE_URL, handleResponse, handleVoidResponse } from '../../../services/httpClient'
import type { CreateTaskRequest, ReorderTasksRequest, Task, UpdateTaskRequest } from '../types'

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export function fetchTasks(token: string): Promise<Task[]> {
  return fetch(`${API_BASE_URL}/api/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleResponse<Task[]>(res))
}

export function createTask(token: string, request: CreateTaskRequest): Promise<Task> {
  return fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  }).then((res) => handleResponse<Task>(res))
}

export function updateTask(token: string, taskId: number, request: UpdateTaskRequest): Promise<Task> {
  return fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  }).then((res) => handleResponse<Task>(res))
}

export function deleteTask(token: string, taskId: number): Promise<void> {
  return fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => handleVoidResponse(res))
}

export function reorderTasks(token: string, request: ReorderTasksRequest): Promise<void> {
  return fetch(`${API_BASE_URL}/api/tasks/reorder`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  }).then((res) => handleVoidResponse(res))
}
