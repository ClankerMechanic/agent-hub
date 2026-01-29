import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AgentCard } from './AgentCard';

export function SortableAgentCard({ agent, onClick, onEdit, onDelete, isPinned, onTogglePin, isManualSort }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AgentCard
        agent={agent}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        showDragHandle={isManualSort}
        dragHandleProps={listeners}
      />
    </div>
  );
}
