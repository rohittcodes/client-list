"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { SortCriterion } from "@/lib/types"
import {
  GripVertical,
  X,
  UserIcon as TableUser,
  CalendarIcon as TableCalendar,
  TableIcon as TableId,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface SortableItemProps {
  id: string
  criterion: SortCriterion
  onRemove: (id: string) => void
  onToggleDirection: (id: string) => void
  icon?: ReactNode
  label?: string
  isHidden?: boolean
  isDragOverlay?: boolean
  isDropTarget?: boolean
  index?: number
}

export function SortableItem({ 
  id, 
  criterion, 
  onRemove, 
  onToggleDirection,
  icon,
  label,
  isHidden = false,
  isDragOverlay = false,
  isDropTarget = false,
  index = 0
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    disabled: isDragOverlay
  })

  // Calculate z-index to prevent shadow overlap
  // Give higher items a lower z-index when not being dragged
  // Give dragged items the highest z-index
  const zIndex = isDragging ? 50 : isDropTarget ? 40 : 30 - index;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isHidden ? 0 : isDragging ? 0.6 : 1,
    visibility: isHidden ? "hidden" as const : "visible" as const,
    zIndex,
  }

  const getFieldIcon = (field: string) => {
    if (icon) return icon;
    
    switch (field) {
      case "name":
        return <TableUser className="h-4 w-4 mr-2" />
      case "createdAt":
      case "updatedAt":
        return <TableCalendar className="h-4 w-4 mr-2" />
      case "id":
        return <TableId className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  const getFieldLabel = (field: string) => {
    if (label) return label;
    
    const fieldMap: Record<string, string> = {
      id: "Client ID",
      name: "Client Name",
      createdAt: "Created At",
      updatedAt: "Updated At",
    }
    return fieldMap[field] || field
  }

  const getDirectionText = (field: string, direction: string) => {
    if (field === "createdAt" || field === "updatedAt") {
      return direction === "asc" ? "Newest" : "Oldest";
    }
    
    if (field === "id") {
      return direction === "asc" ? "1-9" : "9-1";
    }
    
    return direction === "asc" ? "A-Z" : "Z-A";
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={isDragging 
        ? { 
            scale: 1.03, 
            boxShadow: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
            zIndex: 50
          } 
        : isDragOverlay
        ? {
            scale: 1.05,
            boxShadow: "0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22)",
            zIndex: 100
          }
        : isDropTarget
        ? {
            scale: 1.01,
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
            backgroundColor: "rgba(243, 244, 246, 1)"
          }
        : { 
            scale: 1, 
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
            backgroundColor: "rgba(255, 255, 255, 1)"
          }
      }
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 300 
      }}
      className={`flex items-center gap-2 p-2 rounded-md border ${
        isDragging ? "border-blue-500 bg-blue-50" : 
        isDragOverlay ? "border-blue-500 bg-white shadow-xl" : 
        isDropTarget ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
      } ${isDragOverlay ? "cursor-grabbing" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center flex-1">
        {getFieldIcon(criterion.field)}
        <span className="text-sm">{getFieldLabel(criterion.field)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleDirection(id)
          }}
          className="flex items-center px-3 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200"
        >
          {criterion.direction === "asc" ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              {getDirectionText(criterion.field, criterion.direction)}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              {getDirectionText(criterion.field, criterion.direction)}
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(id)
          }}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  )
}

