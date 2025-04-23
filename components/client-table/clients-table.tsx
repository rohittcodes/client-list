"use client"

import { useState } from "react"
import type { ClientData } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"
import { TableIcon as TableGrid } from "lucide-react"

interface ClientsTableProps {
  clients: ClientData[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <TableGrid className="h-4 w-4 mr-2 text-gray-400" />
                Client ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated By
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {clients.map((client) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className={`border-b border-gray-200 ${
                    hoveredRow === client.id ? "bg-gray-50" : "bg-white"
                  } transition-colors`}
                  onMouseEnter={() => setHoveredRow(client.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-500">{client.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{client.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{client.type}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : client.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{client.updatedBy}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
