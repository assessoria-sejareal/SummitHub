export interface User {
  id: string
  name: string
  fullName: string
  cpf: string
  phone: string
  company: string
  email: string
  role: 'TRADER' | 'ADMIN'
  createdAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  fullName: string
  cpf: string
  phone: string
  company: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}