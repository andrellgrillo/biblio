# Biblio - Sistema de Gestão de Bibliotecas

Biblio é uma aplicação moderna para gestão de bibliotecas, construída com Next.js 15, Prisma ORM e PostgreSQL. O sistema oferece uma interface completa para bibliotecários e leitores, com foco em automação, design premium e facilidade de uso.

![Aesthetics](https://img.shields.io/badge/Aesthetics-Pastel%20Multicolor-ff69b4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)

## ✨ Funcionalidades

### 🏛️ Painel Administrativo (Librarian)
- **Gestão de Acervo:** CRUD completo de livros com integração de APIs externas (Brasil API e Google Books) para auto-preenchimento via ISBN.
- **Controle de Exemplares:** Gestão individual de cópias físicas, monitorando estado de conservação e disponibilidade.
- **Motor de Empréstimos:** Registro ágil de retiradas e devoluções com suporte a leitor de código de barras.
- **Fila de Reserva FIFO:** Sistema automatizado que promove o próximo leitor da fila assim que um exemplar é devolvido.
- **Dashboard de Analytics:** Visualização rápida de livros ativos, empréstimos em atraso e novas reservas.

### 📖 Área do Leitor (Reader)
- **Meus Empréstimos:** Histórico detalhado e status atual de livros retirados, com cronômetro de devolução.
- **Minhas Reservas:** Cadastro em fila de espera e acompanhamento da posição atual na fila.
- **Perfil e Dashboard:** Resumo visual das atividades do leitor.

### 🎨 Design & UX
- **Theme Multi-Pastel:** Cores suaves (Azul, Rosa, Verde, Amarelo e Vermelho) para uma experiência visual descansada e moderna.
- **Glassmorphism:** Componentes com efeitos de transparência e desfoque.
- **Compatibilidade com Hardware:** Otimizado para uso com scanners de código de barras (ISBN).

## 🚀 Tecnologias Utilizadas

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Estilização:** Tailwind CSS v4
- **Autenticação:** NextAuth.js
- **Ícones:** Lucide React

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/andrellgrillo/biblio.git
cd biblio
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` baseado no seu ambiente:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/biblio"
AUTH_SECRET="seu-secret-aqui"
```

4. Prepare o banco de dados:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Inicie o servidor:
```bash
npm run dev
```

## 🔐 Credenciais de Teste (Seed)

- **Admin:** `admin@biblio.com` / `admin123`
- **Leitor:** `leitor@biblio.com` / `leitor123`

---
Desenvolvido com ❤️ por Antigravity.
