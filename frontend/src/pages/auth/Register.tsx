import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/global/useAuth'
import { RegisterData } from '../../@types/auth'
import { registerSchema } from '../../validators/auth'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { phoneMask } from '../../utils/masks'
import { cpfMask } from '../../utils/masks'
import logoSvg from '../../assets/images/logo.svg'

export const Register = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  })
  
  const cpfValue = watch('cpf')
  const phoneValue = watch('phone')

  const onSubmit = async (data: RegisterData) => {
    try {
      setLoading(true)
      setError('')
      await registerUser(data)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
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
            Crie sua conta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpfMask(cpfValue || '')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '')
                setValue('cpf', rawValue)
              }}
              error={errors.cpf?.message}
            />
            
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              maxLength={15}
              value={phoneMask(phoneValue || '')}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '')
                setValue('phone', rawValue)
              }}
              error={errors.phone?.message}
            />
            
            <Input
              label="Empresa/Corretora"
              placeholder="Nome da sua empresa ou corretora"
              {...register('company')}
              error={errors.company?.message}
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              error={errors.email?.message}
            />
            
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
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
            Criar Conta
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-500"
            >
              Já tem conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}