export type Pagination = {
  page: number
  perPage: number
  total: number
  pages: number
}

export function paginate<T>(items: T[], page = 1, perPage = 10) {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const end = start + perPage
  return {
    items: items.slice(start, end),
    meta: { page, perPage, total, pages } as Pagination,
  }
}

