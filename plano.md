# Plano de Implementação: Sistema de Biblioteca

Este documento serve como a "Bússola" para a construção do nosso sistema, garantindo clareza e previsibilidade metodológica antes de entrarmos no código propriamente dito.

## 🎯 1. Escopo e Solução Técnica
A solução será baseada em **Next.js (App Router)** com **PostgreSQL**, utilizando o **Prisma ORM** para comunicação de dados e o **NextAuth.js** para lidar com autenticação de banco próprio.

### Atores e Níveis de Acesso
1. **Bibliotecário (LIBRARIAN):** Tem acesso ao painel de administração (`/admin/*`). Cadastra livros, exemplares, realiza empréstimos físicos no balcão e gerencia filas de reservas e devoluções.
2. **Leitor (READER):** Tem acesso ao painel público e à área logada (`/dashboard`). Pode pesquisar o acervo, ver o próprio histórico de locações, prazos de devolução e entrar na fila de espera/reservas de livros.

## 🧩 2. Modelagem do Banco de Dados Principal

Toda regra de negócios circulará ao redor dessas 5 entidades-chave:

1. **`User` (Usuários):** Leitores e Bibliotecários (controle via `role`).
2. **`Book` (Livro - Catálogo):** A obra genérica. Contém título, autor, ISBN, capa, sinopse.
3. **`Copy` (Exemplar - Estoque Físico):** O artefato físico que é emprestado. Pertence a um `Book`. Possui um ID único de código de barras ou numérico e gerencia status (Disponível, Emprestado, Danificado, Perdido).
4. **`Loan` (Empréstimo):** A transação ligando um `User`, uma `Copy`, a Data de Operação e a Data Limite (Due Date).
5. **`Reservation` (Reserva):** A intenção. Liga um `User` a um `Book` (não a uma copy, pois qualquer copy devolvida serve). Gera uma Fila FIFO (First-In-First-Out).

## 🚀 3. Fases de Execução

### Fase 1: Fundação (Infra & Banco de Dados)
- [ ] Scaffold do projeto usando o Builder (Next.js, TypeScript, TailwindCSS v4).
- [ ] Configuração de infraestrutura (Prisma ORM integrado).
- [ ] Instalação e provisionamento do PostgreSQL.
- [ ] Implementação de migrações (`schema.prisma`) das cinco entidades principais.
- [ ] Criação de "Seeds" básicos para testarmos com um catálogo e usuários falsos.

### Fase 2: Autenticação & Layout Base
- [ ] Configurar NextAuth.js com Credentials Provider (E-mail + Senha c/ hashing bcrypt).
- [ ] Implementar Telas de Login e Cadastro (para Leitores e primeiro admin).
- [ ] Construir layout da rota pública (Catálogo) e da rota privada (`/admin` protegida por Middleware).

### Fase 3: Gestão de Acervo (CRUDs Base)
- [ ] **Painel Admin:** Interface de gerenciamento de Livros (`Books`).
- [ ] **Painel Admin:** Interface de adição e remoção do estoque de Exemplares (`Copies`).
- [ ] **Público:** Interface de busca, paginação e visualização de Livros.

### Fase 4: O Motor da Biblioteca (Empréstimos & Reservas)
- [ ] **Admin:** Criar fluxo na interface para registrar novo `Loan` (busca o usuário e bipa/insere a `Copy`).
- [ ] **Admin:** Criar fluxo de devolução do `Loan`.
- [ ] **Leitor:** Permitir o clique em "Reservar Livro" para itens sem exemplares disponíveis.
- [ ] **Lógica Server-side:** Ao realizar devolução, o sistema verifica a tabela de Reservas e altera o status de `PENDING` para `AWAITING_PICKUP` para o 1º da fila, notificando na interface.

### Fase 5: UI/UX & Refinamento Operacional
- [ ] **Dashboard Leitor:** Meus Livros, Prazos e Status da Fila de Reservas.
- [ ] **Dashboard Admin:** Visão rápida de livros atrasados ou livros mofando nas prateleiras (Reservados e não buscados).
- [ ] **Auditoria de Qualidade:** Lint, testes estáticos e Sombra/Mobile UX (Acessibilidade garantida pelas skills recomendadas).

---
*Este plano passará pelo crivo do usuário e evoluirá como a fonte de verdade (Source of Truth) durante todo o avanço.*
