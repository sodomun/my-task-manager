import { useState } from 'react'
import type { CreateTaskRequest, Priority, Task, TimeSlot } from '../types'
import { PRIORITY_LABELS, TIME_SLOT_LABELS } from '../types'

interface Props {
  initial?: Task
  onSubmit: (request: CreateTaskRequest) => Promise<void>
  onClose: () => void
}

const TIME_SLOTS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']
const PRIORITIES: Priority[] = ['HIGH', 'MEDIUM', 'LOW']

export function TaskForm({ initial, onSubmit, onClose }: Props) {
  const [type, setType] = useState(initial?.type ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [timeSlot, setTimeSlot] = useState<TimeSlot | ''>(initial?.timeSlot ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [dueTimeSlot, setDueTimeSlot] = useState<TimeSlot | ''>(initial?.dueTimeSlot ?? '')
  const [priority, setPriority] = useState<Priority | ''>(initial?.priority ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!priority || !dueDate) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        type,
        title,
        timeSlot: timeSlot || null,
        dueDate,
        dueTimeSlot: dueTimeSlot || null,
        priority,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px', color: '#2d3748', fontSize: 18 }}>
          {initial ? 'タスクを編集' : 'タスクを追加'}
        </h2>
        {error && (
          <div
            style={{
              background: '#fff5f5',
              color: '#c53030',
              padding: '8px 12px',
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={labelStyle}>
            種類 <span style={{ color: '#e53e3e' }}>*</span>
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              placeholder="例: 仕事、勉強"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            課題名 <span style={{ color: '#e53e3e' }}>*</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="例: 資料作成"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            取り組む時間帯
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value as TimeSlot | '')}
              style={inputStyle}
            >
              <option value="">未設定</option>
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {TIME_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            完了期限 <span style={{ color: '#e53e3e' }}>*</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            期限の時間帯
            <select
              value={dueTimeSlot}
              onChange={(e) => setDueTimeSlot(e.target.value as TimeSlot | '')}
              style={inputStyle}
            >
              <option value="">未設定</option>
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {TIME_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            優先度 <span style={{ color: '#e53e3e' }}>*</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority | '')}
              required
              style={inputStyle}
            >
              <option value="">選択してください</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              キャンセル
            </button>
            <button type="submit" disabled={submitting} style={submitButtonStyle}>
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 14,
  color: '#4a5568',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #cbd5e0',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const submitButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 20px',
  background: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
  fontWeight: 600,
}

const cancelButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#edf2f7',
  color: '#4a5568',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
}
