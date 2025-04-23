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
  
  // Update local sort criteria when parent criteria changes and not during dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalSortCriteria([...sortCriteria]);
    }
  }, [sortCriteria]);
  
  // Add click outside handler for sort panel
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
        distance: 8, // This helps prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reordering logic that can be shared between events
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
    
    // Find the criterion that's being dragged
    const draggedCriterion = localSortCriteria.find(c => c.id === active.id);
    if (draggedCriterion) {
      setActiveDragData({...draggedCriterion});
    }
    
    // Add a class to the body for styling during drag
    document.body.classList.add('sorting-active');
  };
  
  // Adjust handleDragOver to set activeDropId to the drop slot index
  const handleDragOver = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    // Get index of the item being dragged
    const activeIndex = localSortCriteria.findIndex((c) => c.id === active.id);
    
    // Get index of the item being dragged over
    const overIndex = localSortCriteria.findIndex((c) => c.id === over.id);
    
    // Special handling for when the cursor is over a sortable item
    if (overIndex !== -1) {
      // Handle first position special case
      if (overIndex === 0) {
        const overRect = over.rect;
        const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
        
        // If mouse is in the top half of the first item, position before it
        if (overRect && mouseY < overRect.top + overRect.height / 2) {
          moveItemToPosition(activeIndex, 0);
          return;
        }
      }
      
      // Handle last position special case
      if (overIndex === localSortCriteria.length - 1) {
        const overRect = over.rect;
        const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
        
        // If mouse is in the bottom half of the last item, position after it
        if (overRect && mouseY > overRect.top + overRect.height / 2) {
          moveItemToPosition(activeIndex, localSortCriteria.length);
          return;
        }
      }
      
      // Normal case - determine if we should position before or after the item
      const overRect = over.rect;
      const mouseY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
      
      if (overRect) {
        // If mouse is in the top half, position before; otherwise, position after
        const targetIndex = mouseY < overRect.top + overRect.height / 2 ? overIndex : overIndex + 1;
        moveItemToPosition(activeIndex, targetIndex);
      }
    } else {
      // If not over a sortable item, assume last position
      moveItemToPosition(activeIndex, localSortCriteria.length);
    }
  };
  
  // Helper to move an item to a specific position and update state
  const moveItemToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    // Create a new array for reordering
    const newItems = [...localSortCriteria];
    
    // Remove the item from its current position
    const [draggedItem] = newItems.splice(fromIndex, 1);
    
    // Insert at the target position
    newItems.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, draggedItem);
    
    // Update local state
    setLocalSortCriteria(newItems);
    
    // Update parent component
    if (onUpdateSortCriteria) {
      onUpdateSortCriteria(newItems);
    }
    
    // Set the active drop target
    setActiveDropId(`drop-${toIndex}`);
  };

  // Adjust handleDragEnd to reset activeDropId
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Remove the sorting class
    document.body.classList.remove('sorting-active');
    
    // Clear active drop target
    setActiveDropId(null);
    isDraggingRef.current = false;

    if (over && active.id !== over.id) {
      // Create the final sort criteria array after reordering
      const newSortCriteria = reorderItems(
        active.id as string, 
        over.id as string, 
        localSortCriteria
      );
      
      // Set the final local state
      setLocalSortCriteria(newSortCriteria);
      
      // Apply the changes to the parent component
      if (onUpdateSortCriteria) {
        onUpdateSortCriteria(newSortCriteria);
      }
    }
    
    // Reset drag state
    setActiveDragId(null);
    setActiveDragData(null);
  };

  // Helper to render drop indicators at every slot
  const renderDropIndicator = (index: number) => {
    // Highlight if this is the current drop target
    const isActive = activeDropId === `drop-${index}`;
    
    // Only render if active
    if (!isActive) return null;
    
    // Get the drag direction by comparing indices
    const activeItemIndex = localSortCriteria.findIndex(item => item.id === activeDragId);
    const movingDown = activeItemIndex < index;
    
    // Return enhanced indicator that shows direction
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
      
      {/* Drag overlay for smooth animations */}
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
