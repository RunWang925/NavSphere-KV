export interface SessionData {
  user?: {
    name?: string
    email?: string
    image?: string
  }
  isLoggedIn: boolean
}