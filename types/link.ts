export interface Link {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  title?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateLinkRequest {
  originalUrl: string
  title?: string
}

export interface CreateLinkResponse {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  title?: string
  createdAt: string
}

export interface GetLinksResponse {
  links: Link[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
