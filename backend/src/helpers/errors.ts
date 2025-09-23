export class AppError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode }
  }
  
  if (error instanceof Error) {
    console.error('Erro interno')
    return { message: 'Erro interno do servidor', statusCode: 500 }
  }
  
  console.error('Erro desconhecido')
  return { message: 'Erro interno do servidor', statusCode: 500 }
}