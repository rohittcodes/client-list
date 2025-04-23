"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { type SortCriterion } from "@/lib/types"
import { SortPanel } from "./sort-panel"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  closestCorners,
} from "@dnd-kit/core"
import { 
  restrictToVerticalAxis, 
  restrictToWindowEdges,
} from "@dnd-kit/modifiers"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { SortableItem } from "./sortable-item"

interface SortPanelContainerProps {
  sortCriteria: SortCriterion[]
  onAddCriterion: (field: string) => void
  onRemoveCriterion: (id: string) => void
  onToggleDirection: (id: string) => void
  onClearAll: () => void
  onClose: () => void
  onUpdateSortCriteria?: (criteria: SortCriterion[]) => void
}

export function SortPanelContainer({
  sortCriteria,
  onAddCriterion,
  onRemoveCriterion,
  onToggleDirection,
  onClearAll,
  onClose,
  onUpdateSortCriteria
}: SortPanelContainerProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<SortCriterion | null>(null)
  const [activeDropId, setActiveDropId] = useState<string | null>(null)
  const [localSortCriteria, setLocalSortCriteria] = useState<SortCriterion[]>(sortCriteria)
  const sortPanelRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalSortCriteria([...sortCriteria]);
    }
  }, [sortCriteria]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortPanelRef.current && !sortPanelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderItems = useCallback((activeId: string, overId: string, items: SortCriterion[]) => {
    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      return arrayMove(items, oldIndex, newIndex);
    }
    
    return items;
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    isDraggingRef.current = true;
    
    const draggedCriterion = localSortCriteria.find(c => c.id === active.id);
    if (draggedCriterion) {
      setActiveDragData({...draggedCriterion});
    }
    
    document.body.classList.add('sorting-active');
  };
  
  const handleDragOver = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeIndex = localSortCriteria.findIndex((c) => c.id === active.id);
    const overIndex = localSortCriteria.findIndex((c) => c.id === over.id);
    
    if (overIndex !== -1) {
      if (overIndex === 0) {
        const overRect = over.rect;
        const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
        
        if (overRect && mouseY < overRect.top + overRect.height / 2) {
          moveItemToPosition(activeIndex, 0);
          return;
        }
      }
      
      if (overIndex === localSortCriteria.length - 1) {
        const overRect = over.rect;
        const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
        
        if (overRect && mouseY > overRect.top + overRect.height / 2) {
          moveItemToPosition(activeIndex, localSortCriteria.length);
          return;
        }
      }
      
      const overRect = over.rect;
      const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
      
      if (overRect) {
        const targetIndex = mouseY < overRect.top + overRect.height / 2 ? overIndex : overIndex + 1;
        moveItemToPosition(activeIndex, targetIndex);
      }
    } else {
      moveItemToPosition(activeIndex, localSortCriteria.length);
    }
  };
  
  const moveItemToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newItems = [...localSortCriteria];
    const [draggedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, draggedItem);
    
    setLocalSortCriteria(newItems);
    
    if (onUpdateSortCriteria) {
      onUpdateSortCriteria(newItems);
    }
    
    setActiveDropId(`drop-${toIndex}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    document.body.classList.remove('sorting-active');
    setActiveDropId(null);
    isDraggingRef.current = false;

    if (over && active.id !== over.id) {
      const newSortCriteria = reorderItems(
        active.id as string, 
        over.id as string, 
        localSortCriteria
      );
      
      setLocalSortCriteria(newSortCriteria);
      
      if (onUpdateSortCriteria) {
        onUpdateSortCriteria(newSortCriteria);
      }
    }
    
    setActiveDragId(null);
    setActiveDragData(null);
  };

  const renderDropIndicator = (index: number) => {
    const isActive = activeDropId === `drop-${index}`;
    
    if (!isActive) return null;
    
    const activeItemIndex = localSortCriteria.findIndex(item => item.id === activeDragId);
    const movingDown = activeItemIndex < index;
    
    return (
      <div className="h-1 relative my-1 rounded-md overflow-hidden">
        <div 
          className={`absolute inset-0 ${movingDown ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-blue-400 to-blue-600 animate-pulse`}
          style={{
            height: '4px',
            width: '100%',
            borderRadius: '4px',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '-4px',
            [movingDown ? 'right' : 'left']: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.7)'
          }}
        />
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <div ref={sortPanelRef}>
        <SortPanel
          sortCriteria={localSortCriteria}
          onAddCriterion={onAddCriterion}
          onRemoveCriterion={onRemoveCriterion}
          onToggleDirection={onToggleDirection}
          onClearAll={onClearAll}
          onClose={onClose}
          activeDragId={activeDragId}
          activeDropId={activeDropId}
          renderDropIndicator={renderDropIndicator}
        />
      </div>
      
      <DragOverlay adjustScale={true} zIndex={1000} dropAnimation={{
        duration: 150,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeDragId && activeDragData ? (
          <div className="opacity-90">
            <SortableItem
              id={activeDragId}
              criterion={activeDragData}
              onRemove={onRemoveCriterion}
              onToggleDirection={onToggleDirection}
              isDragOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
