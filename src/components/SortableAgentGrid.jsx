import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortableAgentCard } from './SortableAgentCard';
import { CreateAgentCard } from './AgentCard';

export function SortableAgentGrid({
  agents,
  onSelectAgent,
  onEditAgent,
  onDeleteAgent,
  pinnedAgentIds,
  onTogglePin,
  onReorder,
  isManualSort,
  onCreateAgent
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = agents.findIndex(a => a.id === active.id);
      const newIndex = agents.findIndex(a => a.id === over.id);
      onReorder?.(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={agents.map(a => a.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <SortableAgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onSelectAgent(agent)}
              onEdit={onEditAgent}
              onDelete={onDeleteAgent}
              isPinned={pinnedAgentIds.includes(agent.id)}
              onTogglePin={() => onTogglePin(agent.id)}
              isManualSort={isManualSort}
            />
          ))}
          <CreateAgentCard onClick={onCreateAgent} />
        </div>
      </SortableContext>
    </DndContext>
  );
}
