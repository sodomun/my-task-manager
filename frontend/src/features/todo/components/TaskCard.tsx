import type { Task } from '../types'
import { PRIORITY_COLORS, PRIORITY_LABELS, TIME_SLOT_LABELS } from '../types'

interface Props {
  task: Task
}

export function TaskCard({ task }: Props) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        <span
          style={{
            fontSize: 12,
            color: '#718096',
            background: '#edf2f7',
            padding: '1px 6px',
            borderRadius: 4,
          }}
        >
          {task.type}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: PRIORITY_COLORS[task.priority],
            border: `1px solid ${PRIORITY_COLORS[task.priority]}`,
            padding: '1px 6px',
            borderRadius: 4,
          }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
      <div style={{ fontWeight: 500, color: '#2d3748', marginBottom: 4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: '#718096', display: 'flex', gap: 12 }}>
        <span>
          期限: {task.dueDate}
          {task.dueTimeSlot ? ` (${TIME_SLOT_LABELS[task.dueTimeSlot]})` : ''}
        </span>
        {task.timeSlot && <span>時間帯: {TIME_SLOT_LABELS[task.timeSlot]}</span>}
      </div>
    </div>
  )
}
