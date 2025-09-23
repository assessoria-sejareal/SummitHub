#!/bin/bash
set -e

echo "🚀 Configurando Summit Hub..."

# Verificar se os diretórios existem
if [ ! -d "backend" ]; then
  echo "❌ Diretório backend não encontrado!"
  exit 1
fi

if [ ! -d "frontend" ]; then
  echo "❌ Diretório frontend não encontrado!"
  exit 1
fi

# Backend
echo "📦 Instalando dependências do backend..."
cd backend || exit 1
npm install || { echo "❌ Erro ao instalar dependências do backend"; exit 1; }

echo "🗄️ Configurando banco de dados..."
npx prisma generate || { echo "❌ Erro ao gerar cliente Prisma"; exit 1; }
npx prisma db push || { echo "❌ Erro ao configurar banco"; exit 1; }
npx tsx prisma/seed.ts || { echo "❌ Erro ao popular banco"; exit 1; }

# Frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend || exit 1
npm install || { echo "❌ Erro ao instalar dependências do frontend"; exit 1; }

echo "✅ Setup concluído com sucesso!"
echo ""
echo "Para iniciar o projeto:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Usuário admin padrão:"
echo "Email: admin@summithub.com"
echo "Senha: admin123"