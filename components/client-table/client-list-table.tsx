"use client"

import { useState } from "react"
import { mockClients } from "@/lib/data"
import { ClientsHeader } from "./clients-header"
import { ClientTableContainer } from "./client-table-container"
import { AddClientModal } from "./add-client-modal"
import { type ClientData } from "@/lib/data"

export function ClientListTable() {
  const [clients, setClients] = useState<ClientData[]>(mockClients)
  const [showAddClientModal, setShowAddClientModal] = useState(false)

  const handleAddClient = (newClient: ClientData) => {
    setClients([newClient, ...clients])
    setShowAddClientModal(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ClientsHeader />
      <div className="border-b border-gray-200" />
      
      <ClientTableContainer 
        clients={clients}
        onAddClientClick={() => setShowAddClientModal(true)}
      />

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onAddClient={handleAddClient}
      />
    </div>
  )
}