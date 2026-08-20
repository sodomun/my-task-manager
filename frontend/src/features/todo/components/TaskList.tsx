import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import { TaskCard } from './TaskCard'

interface SortableItemProps {
  task: Task
  isSelected: boolean
  onSelect: (id: number) => void
}

function SortableItem({ task, isSelected, onSelect }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div
        onClick={() => onSelect(task.id)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '12px 16px',
          border: isSelected ? '2px solid #3182ce' : '1px solid #e2e8f0',
          borderRadius: 8,
          background: isDragging ? '#ebf8ff' : isSelected ? '#ebf8ff' : '#fff',
          boxShadow: isDragging
            ? '0 4px 12px rgba(0,0,0,0.15)'
            : '0 1px 3px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          userSelect: 'none',
          opacity: isDragging ? 0.8 : 1,
        }}
      >
        <span
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          style={{
            cursor: 'grab',
            color: '#a0aec0',
            fontSize: 18,
            marginTop: 2,
            flexShrink: 0,
            touchAction: 'none',
          }}
        >
          ⠿
        </span>
        <TaskCard task={task} />
      </div>
    </div>
  )
}

interface Props {
  tasks: Task[]
  selectedTaskId: number | null
  onSelect: (id: number) => void
  onReorder: (orderedIds: number[]) => void
}

export function TaskList({ tasks, selectedTaskId, onSelect, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tasks, oldIndex, newIndex)
    onReorder(reordered.map((t) => t.id))
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#a0aec0', padding: 40 }}>
        タスクがありません。右下の＋ボタンで追加してください。
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => (
            <SortableItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
