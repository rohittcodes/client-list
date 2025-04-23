"use client"

import { useState, useEffect } from "react"
import { type ClientData } from "@/lib/data"
import { ClientActionsBar } from "./client-actions-bar"
import { ClientsTable } from "./clients-table"
import { SortPanelContainer } from "./sort-panel-container"
import { FilterPanel } from "./filter-panel"
import { type SortCriterion } from "@/lib/types"

interface ClientTableContainerProps {
  clients: ClientData[]
  onAddClientClick: () => void
}

export function ClientTableContainer({ clients, onAddClientClick }: ClientTableContainerProps) {
  const [filteredClients, setFilteredClients] = useState<ClientData[]>(clients)
  const [showSortPanel, setShowSortPanel] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Load sort criteria from localStorage on component mount
  useEffect(() => {
    const savedSortCriteria = localStorage.getItem("clientSortCriteria")
    if (savedSortCriteria) {
      setSortCriteria(JSON.parse(savedSortCriteria))
    }
  }, [])

  // Save sort criteria to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("clientSortCriteria", JSON.stringify(sortCriteria))
  }, [sortCriteria])

  // Apply sorting, filtering, and search whenever relevant state changes
  useEffect(() => {
    let result = [...clients]

    // Apply tab filtering
    if (activeTab !== "all") {
      result = result.filter((client) => client.type.toLowerCase() === activeTab.toLowerCase())
    }

    // Apply search filtering
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.id.toLowerCase().includes(query),
      )
    }

    // Apply sorting based on criteria
    if (sortCriteria.length > 0) {
      result = [...result].sort((a, b) => {
        for (const criterion of sortCriteria) {
          const key = criterion.field as keyof ClientData
          const direction = criterion.direction === "asc" ? 1 : -1

          // Handle different data types appropriately
          if (key === "id") {
            // Parse ID as number for numeric comparison
            const idA = parseInt(a[key] as string, 10)
            const idB = parseInt(b[key] as string, 10)
            
            if (idA !== idB) {
              return (idA - idB) * direction
            }
          } 
          else if (key === "createdAt" || key === "updatedAt") {
            const dateA = new Date(a[key] as string).getTime()
            const dateB = new Date(b[key] as string).getTime()
            
            if (dateA !== dateB) {
              return (dateB - dateA) * direction // For dates, newer comes first (reversed)
            }
          } 
          else {
            // String comparison for text fields
            const valueA = String(a[key]).toLowerCase()
            const valueB = String(b[key]).toLowerCase()
            
            if (valueA !== valueB) {
              return valueA.localeCompare(valueB) * direction
            }
          }
        }
        return 0
      })
    }

    // Apply the filtered/sorted data immediately
    setFilteredClients(result)
  }, [clients, sortCriteria, activeTab, searchQuery])

  // Sort panel handlers
  const handleAddSortCriterion = (field: string) => {
    const existingIndex = sortCriteria.findIndex((c) => c.field === field)

    if (existingIndex >= 0) {
      const newCriteria = [...sortCriteria]
      newCriteria[existingIndex] = {
        ...newCriteria[existingIndex],
        direction: newCriteria[existingIndex].direction === "asc" ? "desc" : "asc",
      }
      setSortCriteria(newCriteria)
    } else {
      setSortCriteria([
        ...sortCriteria,
        {
          id: `${field}-${Date.now()}`,
          field,
          direction: "asc",
        },
      ])
    }
  }

  const handleRemoveSortCriterion = (id: string) => {
    setSortCriteria(sortCriteria.filter((c) => c.id !== id))
  }

  const handleToggleSortDirection = (id: string) => {
    setSortCriteria(
      sortCriteria.map((c) => (c.id === id ? { ...c, direction: c.direction === "asc" ? "desc" : "asc" } : c)),
    )
  }

  const handleClearAllSort = () => {
    setSortCriteria([])
  }
  
  const handleUpdateSortCriteria = (criteria: SortCriterion[]) => {
    setSortCriteria(criteria)
  }

  return (
    <div className="px-3 sm:px-6 py-4">
      <ClientActionsBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortCriteriaCount={sortCriteria.length}
        onSortClick={() => {
          setShowSortPanel(!showSortPanel)
          setShowFilterPanel(false)
        }}
        onFilterClick={() => {
          setShowFilterPanel(!showFilterPanel)
          setShowSortPanel(false)
        }}
        onAddClientClick={onAddClientClick}
      />

      <div className="relative overflow-x-auto">
        <ClientsTable clients={filteredClients} />
        
        {showSortPanel && (
          <SortPanelContainer
            sortCriteria={sortCriteria}
            onAddCriterion={handleAddSortCriterion}
            onRemoveCriterion={handleRemoveSortCriterion}
            onToggleDirection={handleToggleSortDirection}
            onClearAll={handleClearAllSort}
            onClose={() => setShowSortPanel(false)}
            onUpdateSortCriteria={handleUpdateSortCriteria}
          />
        )}

        {showFilterPanel && (
          <FilterPanel
            onClose={() => setShowFilterPanel(false)}
          />
        )}
      </div>
    </div>
  )
}