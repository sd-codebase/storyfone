import { useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import { ElementType } from '../../types/script';
import type { SceneElement, DialogueElement } from '../../types/script';
import { useStore } from '../../store';
import ElementCard from './ElementCard';
import { useScenePlayback } from './ScenePlaybackContext';

interface SortableItemProps {
  element: SceneElement;
  sceneId: string;
  isActive: boolean;
  onGenerate: (element: DialogueElement) => void;
  isGenerating: boolean;
}

function SortableItem({ element, sceneId, isActive, onGenerate, isGenerating }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, box-shadow 0.3s ease` : 'box-shadow 0.3s ease',
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 8,
    borderRadius: 8,
    boxShadow: isActive ? '0 0 0 2px #1668dc' : 'none',
  };

  return (
    <div ref={(node) => { setNodeRef(node); (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node; }} style={style}>
      <div
        ref={setActivatorNodeRef}
        className="drag-handle"
        {...attributes}
        {...listeners}
        style={{ marginTop: 12, cursor: 'grab' }}
      >
        <HolderOutlined />
      </div>
      <div style={{ flex: 1 }}>
        <ElementCard
          element={element}
          sceneId={sceneId}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}

interface Props {
  sceneId: string;
  elements: SceneElement[];
  onGenerate: (element: DialogueElement) => void;
  isGenerating: (elementId: string) => boolean;
}

export default function SceneElementList({ sceneId, elements, onGenerate, isGenerating }: Props) {
  const reorderElements = useStore((s) => s.reorderElements);
  const { playingElementId } = useScenePlayback();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = elements.findIndex((e) => e.id === active.id);
    const newIndex = elements.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(elements, oldIndex, newIndex);
    reorderElements(sceneId, reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        {elements.map((element) => (
          <SortableItem
            key={element.id}
            element={element}
            sceneId={sceneId}
            isActive={element.id === playingElementId}
            onGenerate={onGenerate}
            isGenerating={element.type === ElementType.DIALOGUE ? isGenerating(element.id) : false}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
