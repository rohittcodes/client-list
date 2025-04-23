"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface FilterPanelProps {
  onClose: () => void
}

export function FilterPanel({ onClose }: FilterPanelProps) {
  const filterPanelRef = useRef<HTMLDivElement>(null)
  
  // Add click outside handler for filter panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div ref={filterPanelRef} className="absolute right-0 top-0 z-10 bg-white shadow-lg rounded-md p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Filter Clients</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Filter functionality to be implemented</p>
      </div>
    </div>
  )
}