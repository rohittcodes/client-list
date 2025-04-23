"use client"

import { useEffect } from "react"
import type { SortCriterion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { UserIcon as TableUser, CalendarIcon as TableCalendar, TableIcon as TableId, X, ChevronDown, ChevronUp } from "lucide-react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "./sortable-item"

interface SortPanelProps {
  sortCriteria: SortCriterion[]
  onAddCriterion: (field: string) => void
  onRemoveCriterion: (id: string) => void
  onToggleDirection: (id: string) => void
  onClearAll: () => void
  onClose: () => void
  activeDragId?: string | null
  activeDropId?: string | null
  renderDropIndicator?: (index: number) => React.ReactNode
}

export function SortPanel({
  sortCriteria,
  onAddCriterion,
  onRemoveCriterion,
  onToggleDirection,
  onClearAll,
  onClose,
  activeDragId,
  activeDropId,
  renderDropIndicator
}: SortPanelProps) {
  const sortableFields = [
    { id: "name", label: "Client Name", icon: <TableUser className="h-4 w-4" /> },
    { id: "id", label: "Client ID", icon: <TableId className="h-4 w-4" /> },
    { id: "createdAt", label: "Created At", icon: <TableCalendar className="h-4 w-4" /> },
    { id: "updatedAt", label: "Updated At", icon: <TableCalendar className="h-4 w-4" /> },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const getFieldSortCriterion = (fieldId: string) => {
    return sortCriteria.find((c) => c.field === fieldId);
  }

  const renderSortButton = (fieldId: string, direction: "asc" | "desc", label: string) => {
    const criterion = getFieldSortCriterion(fieldId);
    const isActive = criterion && criterion.direction === direction;
    
    const handleClick = () => {
      if (!criterion) {
        onAddCriterion(fieldId);
        if (direction === "desc") {
          const newCriterion = sortCriteria.find(c => c.field === fieldId);
          if (newCriterion) {
            onToggleDirection(newCriterion.id);
          }
        }
      } else if (criterion.direction !== direction) {
        onToggleDirection(criterion.id);
      } else {
        onRemoveCriterion(criterion.id);
      }
    };
    
    return (
      <button
        onClick={handleClick}
        className={`flex items-center px-3 py-1 rounded-md text-xs border ${
          isActive ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {direction === "asc" ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
        {label}
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-0 z-10 w-[350px] bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base font-medium">Sort By</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 rounded-full hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        <SortableContext 
          items={sortCriteria.map(c => c.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activeDragId && renderDropIndicator && renderDropIndicator(0)}
            
            {sortCriteria.map((criterion, index) => (
              <div key={criterion.id} className="relative">
                {criterion.id !== activeDragId && (
                  <SortableItem
                    id={criterion.id}
                    criterion={criterion}
                    onRemove={onRemoveCriterion}
                    onToggleDirection={onToggleDirection}
                    icon={sortableFields.find(f => f.id === criterion.field)?.icon}
                    label={sortableFields.find(f => f.id === criterion.field)?.label}
                    isDropTarget={activeDropId === `drop-${index}`}
                    index={index}
                  />
                )}
                {activeDragId && renderDropIndicator && renderDropIndicator(index + 1)}
              </div>
            ))}
          </div>
        </SortableContext>

        <div className={`${sortCriteria.length > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}`}>
          <h4 className="text-sm font-medium mb-2">Available Fields</h4>
          <div className="space-y-2">
            {sortableFields.map((field) => {
              const criterion = getFieldSortCriterion(field.id);
              if (!criterion) {
                return (
                  <div 
                    key={field.id} 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {field.icon}
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {field.id === "createdAt" || field.id === "updatedAt" ? (
                        <>
                          {renderSortButton(field.id, "asc", "Newest")}
                          {renderSortButton(field.id, "desc", "Oldest")}
                        </>
                      ) : field.id === "id" ? (
                        <>
                          {renderSortButton(field.id, "asc", "1-9")}
                          {renderSortButton(field.id, "desc", "9-1")}
                        </>
                      ) : (
                        <>
                          {renderSortButton(field.id, "asc", "A-Z")}
                          {renderSortButton(field.id, "desc", "Z-A")}
                        </>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {sortCriteria.length > 0 && (
        <div className="flex justify-end p-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            Clear all
          </Button>
        </div>
      )}
    </motion.div>
  )
}
