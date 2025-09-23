import api from '../../utils/api'
import { LoginData, RegisterData, AuthResponse } from '../../@types/auth'

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  }
}