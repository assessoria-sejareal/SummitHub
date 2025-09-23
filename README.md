# Summit Hub - Sistema de Reservas

Sistema web profissional para reserva de 20 estações de trabalho para traders com segurança empresarial e interface moderna.

## 🚀 Tecnologias

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT para autenticação
- Zod para validação
- CSRF Protection
- Sistema de Cache
- Logging Seguro

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Material-UI Icons
- Framer Motion (animações)
- React Hook Form + Zod
- Axios para API
- React Router
- Sanitização XSS

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório
2. Configure o PostgreSQL e ajuste a `DATABASE_URL` no arquivo `.env`
3. Execute o script de setup:

```bash
chmod +x setup.sh
./setup.sh
```

## 🏃‍♂️ Executando

### Backend (porta 3001)
```bash
cd backend
npm run dev
```

### Frontend (porta 3065)
```bash
cd frontend
npm run dev
```

## 👤 Usuário Padrão

**Admin:**
- Email: admin@summithub.com
- Senha: admin123

## 📁 Estrutura

```
summit-hub/
├── backend/          # API Node.js
├── frontend/         # App React
├── setup.sh          # Script de instalação
└── README.md
```

## 🔧 Funcionalidades

### Traders
- ✅ Login/cadastro com dados completos (CPF, telefone, empresa)
- ✅ Dashboard interativo com animações
- ✅ Ver estações disponíveis em tempo real
- ✅ Mapas de assentos interativos com plantas reais
- ✅ Fazer reserva simplificada
- ✅ Cancelar reserva
- ✅ Ver minhas reservas
- ✅ Interface responsiva mobile-first

### Admin
- ✅ **Analytics Avançado**
  - Gráfico de ocupação por estação
  - Gráfico de reservas por período (diário/semanal/mensal)
  - Taxa de ocupação em tempo real
  - Horários de pico com visualização
- ✅ **Gestão Avançada**
  - Cancelar reservas diretamente pelo admin
  - Bloquear/desbloquear estações para manutenção
  - Histórico completo de ações administrativas
  - Exportar relatórios (CSV)
- ✅ Painel administrativo com 3 seções (Visão Geral, Analytics, Gestão)
- ✅ Gerenciamento completo de usuários e estações

## 🔒 Segurança

- ✅ **Proteção CSRF** - Tokens únicos por sessão
- ✅ **Sanitização XSS** - Prevenção de scripts maliciosos
- ✅ **JWT Seguro** - Tratamento robusto de erros
- ✅ **Logging Seguro** - Sanitização de inputs
- ✅ **Cache de Usuários** - Performance otimizada
- ✅ **Validação Rigorosa** - Zod em frontend e backend
- ✅ **Auditoria Completa** - Sistema aprovado para produção

## 🗄️ Banco de Dados

### Tabelas Principais
- **users**: Usuários completos (nome, email, CPF, telefone, empresa)
- **stations**: 5 estações com status (ACTIVE/MAINTENANCE)
- **bookings**: Reservas com campos de cancelamento
- **admin_actions**: Histórico de ações administrativas

### Relacionamentos
- User 1:N Booking (um usuário pode ter várias reservas)
- User 1:N AdminAction (um admin pode ter várias ações)
- Station 1:N Booking (uma estação pode ter várias reservas)
- Constraints de unicidade e validação

### Novos Campos
- **bookings**: cancelledAt, cancelReason
- **admin_actions**: userId, action, targetId, reason, createdAt

## 📊 Status do Projeto

- ✅ **Desenvolvimento Completo**
- ✅ **Analytics e Relatórios Implementados**
- ✅ **Gestão Administrativa Avançada**
- ✅ **Mapas de Assentos com Plantas Reais**
- ✅ **Testes de Segurança Aprovados**
- ✅ **Interface Moderna e Responsiva**
- ✅ **Pronto para Produção**

## 🎯 Funcionalidades Implementadas Recentemente

- ✅ **Gráficos e Analytics**
  - Recharts para visualização de dados
  - Ocupação por estação em tempo real
  - Tendências de reservas por período
  - Identificação de horários de pico

- ✅ **Gestão Administrativa**
  - Cancelamento de reservas pelo admin
  - Controle de status das estações
  - Auditoria completa de ações
  - Exportação de relatórios CSV

- ✅ **Mapas de Assentos**
  - Plantas SVG reais das estações
  - Seleção interativa de assentos
  - Visualização responsiva mobile/desktop

## 🚀 Deploy em Produção

### Railway (Recomendado)

O sistema está **100% pronto** para deploy na Railway:

```bash
# 1. Commit o código
git add .
git commit -m "feat: ready for production deploy"
git push origin main

# 2. Siga o guia completo
cat DEPLOY.md
```

**URLs de Produção:**
- Backend: `https://summithub-backend.railway.app`
- Frontend: `https://summithub-frontend.railway.app`
- Custo: ~$5-20/mês

### Recursos Configurados
- ✅ Dockerfile otimizado
- ✅ Nginx com headers de segurança
- ✅ Variáveis de ambiente
- ✅ Build otimizado
- ✅ HTTPS automático
- ✅ PostgreSQL configurado

## 🎯 Próximos Passos

- ✅ **Deploy em produção** - Pronto para Railway
- [ ] Monitoramento e logs avançados
- [ ] Backup automatizado
- [ ] Notificações push em tempo real
- [ ] Domínio customizado
- [ ] CI/CD com GitHub Actions