# Mapa do Site - Futuro Mentoria

Este documento apresenta todas as rotas e páginas disponíveis no sistema de agendamento de mentorias.

---

## 📋 Índice

- [Páginas Públicas](#páginas-públicas)
- [Páginas do Estudante](#páginas-do-estudante)
- [Páginas do Mentor](#páginas-do-mentor)
- [Páginas do Administrador](#páginas-do-administrador)
- [Estrutura de Rotas](#estrutura-de-rotas)

---

## 🌐 Páginas Públicas

### Layout: `(main)`
Acesso público, sem autenticação necessária.

| Rota | Descrição | Componente |
|------|-----------|------------|
| `/` | **Homepage** - Página inicial com formulário de agendamento de mentorias | `(main)/page.tsx` |
| `/login` | **Login** - Página de autenticação para estudantes, mentores e administradores | `(main)/login/page.tsx` |
| `/register` | **Registro** - Página de cadastro de novos usuários (estudantes ou mentores) | `(main)/register/page.tsx` |

#### Funcionalidades da Homepage (`/`)
- Hero section com apresentação do sistema
- Seção de recursos e benefícios
- Seção "Sobre o Sistema"
- **Formulário de Agendamento:**
  - Seleção de data (calendário)
  - Seleção de horário (14h-18h, intervalos de 30min)
  - Seleção de mentor (com horários restantes)
  - Seleção de área do ENEM
  - Campos: Nome, E-mail, Série, Mensagem opcional
  - Resumo do agendamento

---

## 🎓 Páginas do Estudante

### Layout: `estudante/layout.tsx`
Acesso restrito para estudantes autenticados.

| Rota | Descrição | Componente |
|------|-----------|------------|
| `/estudante/dashboard` | **Dashboard do Estudante** - Visão geral de todas as mentorias agendadas | `estudante/dashboard/page.tsx` |
| `/estudante/mentoria/[id]` | **Detalhes da Mentoria** - Informações completas de uma mentoria específica | `estudante/mentoria/[id]/page.tsx` |
| `/estudante/mentoria/[id]/feedback` | **Feedback do Estudante** - Avaliação da mentoria após conclusão | `estudante/mentoria/[id]/feedback/page.tsx` |

#### Dashboard do Estudante (`/estudante/dashboard`)
- **Estatísticas:**
  - Total de mentorias
  - Próximas mentorias
  - Mentorias concluídas
  - Pendências (feedbacks pendentes)
- **Alertas:** Notificações de mentorias aguardando feedback
- **Tabela de Mentorias:**
  - Data/Horário
  - Nome do mentor
  - Área do ENEM
  - Status (Confirmada, Pendente, Concluída, Cancelada)
  - Informações (Material, Mensagem, Preparação, Feedback pendente)
  - Ações (Ver Detalhes, Dar Feedback)

#### Detalhes da Mentoria (`/estudante/mentoria/[id]`)
- **Informações Básicas:**
  - Data e horário
  - Dados do mentor (nome, e-mail)
  - Área do ENEM
  - Status da mentoria
- **Mensagem do Mentor:** Instruções e orientações
- **Itens de Preparação:** Lista do que o estudante deve levar
- **Materiais de Estudo:** Arquivos e links compartilhados pelo mentor
- **Ações:**
  - Dar feedback (se concluída)
  - Contatar mentor

#### Feedback do Estudante (`/estudante/mentoria/[id]/feedback`)
- Avaliação por estrelas (1-5)
- Nível de satisfação (radio buttons)
- Seleção de tópicos abordados (badges clicáveis)
- Campo de comentários (opcional)
- Redirecionamento após envio

---

## 👨‍🏫 Páginas do Mentor

### Layout: `(mentor)/layout.tsx`
Acesso restrito para mentores autenticados.

| Rota | Descrição | Componente |
|------|-----------|------------|
| `/mentor/dashboard` | **Dashboard do Mentor** - Gerenciamento de horários disponíveis | `(mentor)/mentor/mentor/dashboard/page.tsx` |
| `/mentor/mentorias` | **Mentorias Agendadas** - Lista de todas as mentorias do mentor | `(mentor)/mentor/mentorias/page.tsx` |
| `/mentor/mentorias/[id]` | **Gerenciar Mentoria** - Editar informações, adicionar materiais e mensagens | `(mentor)/mentor/mentorias/[id]/page.tsx` |
| `/mentor/mentorias/[id]/feedback` | **Feedback do Mentor** - Avaliação da mentoria após conclusão | `(mentor)/mentor/mentorias/[id]/feedback/page.tsx` |

#### Dashboard do Mentor (`/mentor/dashboard`)
- **Adicionar Disponibilidade:**
  - Calendário para seleção de data
  - Checkboxes para seleção múltipla de horários (14h-18h)
  - Botão "Selecionar todos"
  - Adicionar múltiplos horários de uma vez
- **Estatísticas:**
  - Total de horários cadastrados
  - Horários disponíveis
  - Horários agendados
  - Horários indisponíveis
- **Lista de Horários Cadastrados:**
  - Agrupados por data
  - Status (Disponível, Agendado, Indisponível)
  - Ações: Alternar status, Remover horário

#### Mentorias Agendadas (`/mentor/mentorias`)
- **Estatísticas:**
  - Total de mentorias
  - Próximas mentorias
  - Mentorias concluídas
  - Pendências (feedbacks pendentes)
- **Tabela de Mentorias:**
  - Data/Horário
  - Dados do estudante (nome, e-mail)
  - Área do ENEM
  - Status
  - Informações (Material, Mensagem, Feedback pendente)
  - Ações (Gerenciar)

#### Gerenciar Mentoria (`/mentor/mentorias/[id]`)
- **Informações Básicas:**
  - Data e horário
  - Dados do estudante
  - Área do ENEM
  - Status
- **Mensagem para o Estudante:**
  - Campo de texto para enviar instruções
- **Itens de Preparação:**
  - Adicionar/remover itens que o estudante deve levar
- **Materiais de Estudo:**
  - Upload de arquivos
  - Adicionar links
  - Gerenciar materiais existentes
- **Ações:**
  - Salvar alterações
  - Dar feedback (se concluída)
  - Contatar estudante

#### Feedback do Mentor (`/mentor/mentorias/[id]/feedback`)
- Avaliação por estrelas (1-5)
- Nível de satisfação (radio buttons)
- Seleção de tópicos abordados (badges clicáveis)
- Campo de comentários (opcional)
- Redirecionamento após envio

---

## ⚙️ Páginas do Administrador

### Layout: `(admin)/layout.tsx`
Acesso restrito para administradores autenticados.

| Rota | Descrição | Componente |
|------|-----------|------------|
| `/admin/dashboard` | **Dashboard Administrativa** - Configuração de horários disponíveis | `(admin)/admin/dashboard/page.tsx` |
| `/admin/users` | **Usuários Cadastrados** - Gerenciamento de todos os usuários do sistema | `(admin)/admin/users/page.tsx` |

#### Dashboard Administrativa (`/admin/dashboard`)
- **Estatísticas:**
  - Dias ativos (de 5)
  - Horários disponíveis (total)
  - Total de horários configurados
- **Configuração de Horários:**
  - Ativar/desativar dias da semana (Segunda a Sexta)
  - Ativar/desativar horários individuais (14h-18h, intervalos de 30min)
  - Switches para cada dia e horário
  - Salvar configurações

#### Usuários Cadastrados (`/admin/users`)
- **Estatísticas:**
  - Total de usuários
  - Total de estudantes
  - Total de mentores
- **Busca:** Filtro por nome ou e-mail
- **Tabela de Usuários:**
  - Nome completo
  - E-mail
  - Telefone
  - Tipo (Estudante, Mentor, Admin)
  - Status (Ativo, Inativo)
  - Estatísticas (mentorias, agendamentos, avaliação média)
  - Ações (Ver detalhes)
- **Modal de Detalhes:**
  - Informações completas do usuário
  - Especialidades (para mentores)
  - Série (para estudantes)
  - Estatísticas detalhadas

---

## 🗂️ Estrutura de Rotas

```
/
├── (main)/                    # Páginas públicas
│   ├── /                      # Homepage
│   ├── /login                 # Login
│   └── /register              # Registro
│
├── estudante/                 # Área do estudante
│   ├── /estudante/dashboard
│   └── /estudante/mentoria/
│       └── [id]/
│           ├── /              # Detalhes
│           └── /feedback      # Feedback
│
├── (mentor)/                  # Área do mentor
│   └── mentor/
│       ├── /mentor/dashboard
│       └── /mentor/mentorias/
│           ├── /              # Lista
│           └── [id]/
│               ├── /          # Gerenciar
│               └── /feedback  # Feedback
│
└── (admin)/                   # Área administrativa
    └── admin/
        ├── /admin/dashboard
        └── /admin/users
```

---

## 🔐 Autenticação e Acesso

### Páginas Públicas
- ✅ Acesso sem autenticação
- ✅ Navegação livre

### Páginas do Estudante
- 🔒 Requer autenticação como estudante
- 🔒 Layout específico com menu do estudante
- 🔒 Acesso apenas às rotas `/estudante/*`

### Páginas do Mentor
- 🔒 Requer autenticação como mentor
- 🔒 Layout específico com menu do mentor
- 🔒 Acesso apenas às rotas `/mentor/*`

### Páginas do Administrador
- 🔒 Requer autenticação como administrador
- 🔒 Layout específico com menu do administrador
- 🔒 Acesso apenas às rotas `/admin/*`

---

## 📱 Responsividade

Todas as páginas são totalmente responsivas:
- **Desktop:** Navegação horizontal completa
- **Tablet:** Layout adaptado
- **Mobile:** Menu hambúrguer (Sheet) para navegação

---

## 🎨 Componentes de Navegação

### Menu do Estudante
- Dashboard
- Agendar Mentoria

### Menu do Mentor
- Mentorias
- Disponibilidade

### Menu do Administrador
- Dashboard
- Usuários
- Configurações

---

## 📝 Notas

- Todas as rotas dinâmicas usam `[id]` para identificação
- Os layouts são aplicados automaticamente baseados na estrutura de pastas
- Componentes de navegação são renderizados condicionalmente baseados no tipo de usuário
- Suporte completo a modo claro/escuro em todas as páginas

---


