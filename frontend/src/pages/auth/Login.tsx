import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/global/useAuth'
import { LoginData } from '../../@types/auth'
import { loginSchema } from '../../validators/auth'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { Button } from '../../components/ui/Button'
import logoSvg from '../../assets/images/logo.svg'

export const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginData) => {
    try {
      setLoading(true)
      setError('')
      await login(data)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <img src={logoSvg} alt="Summit Hub" className="mx-auto h-28 w-28 sm:h-32 sm:w-32 mb-4 transition-transform duration-300 hover:scale-110 cursor-pointer" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Summit Hub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login em sua conta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            
            <PasswordInput
              label="Senha"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Entrar
          </Button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-500"
            >
              Não tem conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}