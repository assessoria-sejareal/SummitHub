import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: true
  }
})

interface BookingEmailData {
  userEmail: string
  userName: string
  stationNumber: number
  seatNumber?: number
  date: string
  startTime: string
  endTime: string
  bookingId: string
}

export const emailService = {
  async sendBookingConfirmation(data: BookingEmailData) {
    const seatInfo = data.seatNumber ? ` - Assento ${data.seatNumber}` : ''
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@summithub.com',
      to: data.userEmail,
      subject: '✅ Confirmação de Reserva - Summit Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Summit Hub</h1>
            <p style="color: white; margin: 10px 0 0 0;">Sistema de Reservas</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Reserva Confirmada! 🎉</h2>
            
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>Sua reserva foi confirmada com sucesso!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #333;">Detalhes da Reserva</h3>
              <p><strong>Estação:</strong> ${data.stationNumber}${seatInfo}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> ${data.startTime} às ${data.endTime}</p>
              <p><strong>ID da Reserva:</strong> ${data.bookingId}</p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;">
                <strong>📍 Lembrete:</strong> Chegue com 10 minutos de antecedência.
              </p>
            </div>
            
            <p>Em caso de dúvidas, entre em contato conosco.</p>
            <p>Atenciosamente,<br><strong>Equipe Summit Hub</strong></p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 12px;">
              © 2024 Summit Hub - Sistema de Reservas
            </p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error)
      throw new Error('Falha no envio do email')
    }
  },

  async sendBookingReminder(data: BookingEmailData) {
    const seatInfo = data.seatNumber ? ` - Assento ${data.seatNumber}` : ''
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@summithub.com',
      to: data.userEmail,
      subject: '⏰ Lembrete de Reserva - Summit Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Summit Hub</h1>
            <p style="color: white; margin: 10px 0 0 0;">Lembrete de Reserva</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Sua reserva é amanhã! ⏰</h2>
            
            <p>Olá <strong>${data.userName}</strong>,</p>
            <p>Este é um lembrete da sua reserva para amanhã.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <h3 style="margin-top: 0; color: #333;">Detalhes da Reserva</h3>
              <p><strong>Estação:</strong> ${data.stationNumber}${seatInfo}</p>
              <p><strong>Data:</strong> ${new Date(data.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> ${data.startTime} às ${data.endTime}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <p style="margin: 0; color: #856404;">
                <strong>📋 Checklist:</strong><br>
                ✓ Chegue 10 minutos antes<br>
                ✓ Traga documento de identificação<br>
                ✓ Verifique se tem tudo que precisa
              </p>
            </div>
            
            <p>Nos vemos amanhã!</p>
            <p>Atenciosamente,<br><strong>Equipe Summit Hub</strong></p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 12px;">
              © 2024 Summit Hub - Sistema de Reservas
            </p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error)
      throw new Error('Falha no envio do lembrete')
    }
  }
}