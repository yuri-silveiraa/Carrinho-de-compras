# 🛒 Carrinho de Compras (React Native + Expo)

Aplicativo móvel de listas de compras desenvolvido com **React Native**, **Expo** e **TypeScript**, projetado com foco em privacidade (**Local-First** / sem banco em nuvem) e facilidade de uso no supermercado.

---

## ✨ Funcionalidades Principais

1. **🔐 Login com Google & Privacidade Total**:
   - Cadastro e login integrados com Google.
   - **Zero banco em nuvem**: todos os seus dados ficam salvos unicamente no armazenamento interno do seu aparelho via `AsyncStorage`.
   - Suporte a OAuth oficial do Google (`expo-auth-session`) e modo de acesso rápido local para testes imediatos sem travas de configuração.

2. **✉️ Backup & Migração por E-mail (Troca de Celular)**:
   - Quer trocar de celular ou guardar uma cópia de segurança? Envie todas as suas listas diretamente para o seu e-mail cadastrado em um toque.
   - O e-mail inclui:
     - Resumo humano formatado com todas as listas, itens, valores totais e pagos.
     - Arquivo `backup_listas_compras.json` em anexo para restauração automática no novo dispositivo.
   - Aba para **Restaurar Backup** no próprio app: basta colar o código JSON para recuperar todas as compras.

3. **📋 Tela 1: Visão Geral das Listas (Home)**:
   - Listas ordenadas automaticamente da **mais nova para a mais antiga**.
   - Botão de destaque no topo para **Criar Nova Lista**.
   - **Formatação Inteligente**: se o usuário não digitar um nome, o app atribui automaticamente o formato `[nome do mês / AA]` (exemplo: `Outubro / 26`).
   - Cards com progresso visual, total planejado, total já pago e quantidade de itens.
   - Ao criar a lista, o app navega diretamente para a segunda tela.

4. **🛍️ Tela 2: Detalhes da Lista de Compras**:
   - **Adicionar e Editar Itens** com campos completos:
     - **Nome** do item (obrigatório).
     - **Categoria** com badges e ícones coloridos (*Hortifrúti*, *Carnes & Peixes*, *Laticínios*, *Mercearia*, *Bebidas*, *Padaria*, *Limpeza*, *Higiene*, *Congelados*, *Outros*).
     - **Preço** em R$.
     - **Status de Pagamento**: botão/checkbox para marcar se *já está pago/no carrinho* ou *pendente*.
     - **Peso** (kg ou g): ideal para carnes, frutas e legumes pesados na balança (ex: 1,250 kg x R$ 45,00/kg).
     - **Quantidade**: seletor de unidades (ex: 2 un x R$ 5,00).
   - **Cálculo Automático**: resumo fixo com *Total Geral*, *Total Já Pago*, *Restante a Pagar* e barra de progresso.
   - **Filtros e Busca**: filtre por *Todos*, *Pendentes* ou *Pagos*, e busque por nome ou categoria em tempo real.
   - **Compartilhamento**: botão para compartilhar a lista por WhatsApp, mensagem ou outros apps.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Aplicativo **Expo Go** instalado no celular Android ou iOS (ou emulador).

### Passos:
```bash
# 1. Entre na pasta do projeto
cd carrinho-de-compras

# 2. Inicie o servidor do Expo
npx expo start
```

Escaneie o QR Code que aparecer no terminal usando a câmera (no iOS) ou o app Expo Go (no Android).

---

## 📁 Estrutura de Pastas

```
carrinho-de-compras/
├── src/
│   ├── types/               # Tipos e interfaces TypeScript (List, Item, User, Backup)
│   ├── constants/           # Cores do tema e categorias de compras com ícones
│   ├── contexts/            # Contextos React (AuthContext e ListContext)
│   ├── services/            # Serviços de AsyncStorage, exportação por e-mail e backup
│   ├── utils/               # Formatadores de data ([mês / AA]), moeda (R$) e peso
│   ├── components/          # Cards de itens, listas, modais e cabeçalho
│   └── screens/             # Telas do aplicativo (Login, Home, ListDetail)
├── App.tsx                  # Ponto de entrada com Providers e React Navigation
├── app.json                 # Configuração do Expo e plugins nativos
└── package.json
```
