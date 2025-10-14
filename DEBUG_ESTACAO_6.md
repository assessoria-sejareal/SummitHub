# 🔧 Modo Debug - Estação 6 - Posicionamento de Assentos

## 📋 Como Usar o Modo Debug

### 1. **Acesse a Estação 6**
- Abra o sistema Summit Hub
- Vá para a Estação 6 - Sala de Eventos
- Clique para abrir o mapa de assentos

### 2. **Ative o Modo Debug**
- No final da tela, você verá uma seção "Modo Debug - Estação 6"
- Clique no botão **"Ativar Debug"** (fica verde)
- O botão mudará para vermelho "Desativar Debug"

### 3. **Posicione os Assentos**
- Os assentos agora podem ser **arrastados** com o mouse
- Arraste cada assento para a posição correta sobre a planta SVG
- Os assentos ficam **amarelos** quando estão sendo arrastados
- Use a planta de fundo como referência

### 4. **Exporte as Coordenadas**
- Após posicionar todos os 20 assentos
- Clique no botão **"Exportar Coordenadas (Console)"**
- Abra o Console do navegador (F12)
- Copie as coordenadas que apareceram

### 5. **Aplique as Coordenadas**
- Cole as coordenadas no arquivo `SeatMap.tsx`
- Substitua o array `seatPositions` da Estação 6
- Desative o modo debug
- Teste o posicionamento

## 🎯 Exemplo de Saída

```javascript
Coordenadas dos assentos da Estação 6:
seatPositions: [
      { x: 150, y: 200 }, // Assento 1
      { x: 250, y: 200 }, // Assento 2
      { x: 350, y: 200 }, // Assento 3
      // ... mais coordenadas
    ]
```

## 📝 Dicas Importantes

- **ViewBox:** A Estação 6 usa `0 0 1920 1080` (tamanho real do SVG)
- **Precisão:** As coordenadas são arredondadas automaticamente
- **Ordem:** Os assentos são numerados de 1 a 20 sequencialmente
- **Backup:** Sempre faça backup antes de alterar as coordenadas

## 🔄 Processo Completo

1. ✅ Ativar modo debug
2. ✅ Arrastar assentos para posições corretas
3. ✅ Exportar coordenadas
4. ✅ Copiar do console
5. ✅ Colar no código
6. ✅ Desativar debug
7. ✅ Testar resultado

## 🚨 Importante

- O modo debug **só funciona na Estação 6**
- Não esqueça de **desativar** após usar
- As coordenadas são **temporárias** até serem salvas no código
- Use **F12** para abrir o console do navegador

---

**Status:** ✅ Modo Debug Implementado e Funcional  
**Arquivo:** `frontend/src/components/ui/SeatMap.tsx`  
**Estação:** 6 - Sala de Eventos (20 assentos)