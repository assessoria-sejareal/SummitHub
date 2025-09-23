export interface User {
  id: string
  name: string
  email: string
  role: 'TRADER' | 'ADMIN'
  createdAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}