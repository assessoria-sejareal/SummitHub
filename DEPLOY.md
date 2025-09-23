# 🚀 Deploy na Railway - SummitHub

## Pré-requisitos
- Conta na Railway (https://railway.app)
- Conta no GitHub
- Código commitado no GitHub

## 📋 Passo a Passo

### 1. Preparação do Repositório
```bash
git add .
git commit -m "feat: prepare for Railway deployment"
git push origin main
```

### 2. Deploy do Backend

1. **Acesse Railway**: https://railway.app
2. **Clique em "New Project"**
3. **Selecione "Deploy from GitHub repo"**
4. **Escolha o repositório SummitHub**
5. **Configure o serviço**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 3. Configurar Banco PostgreSQL

1. **No projeto Railway, clique em "New Service"**
2. **Selecione "Database" > "PostgreSQL"**
3. **Copie a DATABASE_URL gerada**

### 4. Configurar Variáveis de Ambiente (Backend)

No painel do backend, vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://[copiado-do-postgresql]
PORT=3001
NODE_ENV=production
JWT_SECRET=sua-chave-jwt-super-secreta-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@summithub.com
FRONTEND_URL=https://summithub-frontend.railway.app
```

### 5. Deploy do Frontend

1. **Clique em "New Service" novamente**
2. **Selecione "Deploy from GitHub repo"**
3. **Escolha o mesmo repositório**
4. **Configure o serviço**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`

### 6. Configurar Domínios

1. **Backend**: Copie a URL gerada (ex: `summithub-backend.railway.app`)
2. **Frontend**: Copie a URL gerada (ex: `summithub-frontend.railway.app`)
3. **Atualize FRONTEND_URL** no backend com a URL do frontend

### 7. Executar Migrações

No terminal do backend na Railway:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## ✅ Verificação

1. **Backend**: Acesse `https://seu-backend.railway.app/health`
2. **Frontend**: Acesse `https://seu-frontend.railway.app`
3. **Login**: admin@summithub.com / admin123

## 🔧 Troubleshooting

### Erro de CORS
- Verifique se FRONTEND_URL está correto no backend
- Redeploy o backend após alterar variáveis

### Erro de Banco
- Verifique se DATABASE_URL está correto
- Execute as migrações manualmente

### Erro de Build
- Verifique se todas as dependências estão no package.json
- Verifique os logs de build na Railway

## 📊 Monitoramento

- **Logs**: Disponíveis no painel da Railway
- **Métricas**: CPU, RAM, Network no dashboard
- **Uptime**: Monitoramento automático

## 💰 Custos Estimados

- **Hobby Plan**: $5/mês (recomendado para teste)
- **Pro Plan**: $20/mês (recomendado para produção)
- **PostgreSQL**: Incluído no plano

## 🔒 Segurança em Produção

- ✅ HTTPS automático
- ✅ Variáveis de ambiente seguras
- ✅ CORS configurado
- ✅ CSRF protection ativo
- ✅ Sanitização XSS
- ✅ JWT seguro

## 🎯 Próximos Passos

1. Configurar domínio customizado
2. Configurar monitoramento avançado
3. Configurar backup automático
4. Implementar CI/CD com GitHub Actions