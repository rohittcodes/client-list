export type SortDirection = "asc" | "desc"

export interface SortCriterion {
  id: string
  field: string
  direction: SortDirection
}

export interface SortCriterion {
  id: string
  field: string
  direction: "asc" | "desc"
}

export interface ClientFilter {
  field: string
  value: string
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "greaterThan" | "lessThan"
}