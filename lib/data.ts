export interface ClientData {
  id: string
  name: string
  type: string
  email: string
  status: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export const mockClients: ClientData[] = [
  {
    id: "20",
    name: "John Doe",
    type: "Individual",
    email: "johndoe@email.com",
    status: "Active",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-04-20T14:45:00Z",
    updatedBy: "M",
  },
  {
    id: "21",
    name: "Test Test",
    type: "Individual",
    email: "test@test.com",
    status: "Active",
    createdAt: "2023-02-10T09:15:00Z",
    updatedAt: "2023-05-12T11:20:00Z",
    updatedBy: "M",
  },
  {
    id: "22",
    name: "Acme Corporation",
    type: "Company",
    email: "contact@acmecorp.com",
    status: "Active",
    createdAt: "2022-11-05T16:40:00Z",
    updatedAt: "2023-06-01T13:10:00Z",
    updatedBy: "M",
  },
  {
    id: "23",
    name: "Tech Innovations Ltd",
    type: "Company",
    email: "info@techinnovations.com",
    status: "Pending",
    createdAt: "2023-03-22T11:25:00Z",
    updatedAt: "2023-03-22T11:25:00Z",
    updatedBy: "M",
  },
  {
    id: "24",
    name: "Robert Johnson",
    type: "Individual",
    email: "robert.j@example.com",
    status: "Inactive",
    createdAt: "2022-09-18T08:50:00Z",
    updatedAt: "2023-05-30T15:35:00Z",
    updatedBy: "M",
  },
  {
    id: "25",
    name: "Global Services Inc",
    type: "Company",
    email: "support@globalservices.com",
    status: "Active",
    createdAt: "2023-01-30T13:45:00Z",
    updatedAt: "2023-04-15T10:20:00Z",
    updatedBy: "M",
  },
]
