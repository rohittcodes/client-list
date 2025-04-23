"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ArrowUpDown, Plus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ClientActionsBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortCriteriaCount: number
  onSortClick: () => void
  onFilterClick: () => void
  onAddClientClick: () => void
}

export function ClientActionsBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortCriteriaCount,
  onSortClick,
  onFilterClick,
  onAddClientClick,
}: ClientActionsBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Handle search toggle
  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    if (!searchOpen) {
      // Reset search query when closing
      onSearchChange("")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 justify-between">
      <div className="hidden sm:block relative">
        <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-auto">
          <div className="border-b border-gray-200 relative">
            <TabsList className="bg-transparent p-0 h-auto relative">
              <TabsTrigger
                value="all"
                className={`px-5 py-2.5 rounded-none relative transition-all duration-200 ${
                  activeTab === "all" ? "text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                } data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                All
                {activeTab === "all" && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="individual"
                className={`px-5 py-2.5 rounded-none relative transition-all duration-200 ${
                  activeTab === "individual" ? "text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                } data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                Individual
                {activeTab === "individual" && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }}
                  />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className={`px-5 py-2.5 rounded-none relative transition-all duration-200 ${
                  activeTab === "company" ? "text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"
                } data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                Company
                {activeTab === "company" && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }}
                  />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <div className="block sm:hidden w-full mb-2">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a tab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center relative">
          <AnimatePresence initial={false}>
            {searchOpen ? (
              <motion.div
                initial={{ width: 40, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 40, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                  onBlur={() => {
                    if (searchQuery === "") {
                      setSearchOpen(false);
                    }
                  }}
                />
              </motion.div>
            ) : (
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-md" 
                onClick={toggleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onSortClick}
          className="relative rounded-md border-gray-300"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortCriteriaCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {sortCriteriaCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="relative rounded-md border-gray-300"
        >
          <Filter className="h-4 w-4" />
        </Button>

        <Button 
          className="bg-black hover:bg-gray-800 text-white rounded-md" 
          onClick={onAddClientClick}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}