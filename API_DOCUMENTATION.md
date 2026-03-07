# Documentação da API - Sistema de Agendamento de Mentorias

Esta documentação descreve os dados que serão enviados e recebidos por cada página do sistema para facilitar a integração com o backend.

## Contrato de dados (frontend ↔ backend)

- **Objeto usuário:** o backend sempre retorna e espera a propriedade **`role`** (não `userType`). Ex.: login, `/auth/me`, listagem de usuários admin — em todos o usuário vem como `{ id, name, email, role: "student" | "mentor" | "admin", ... }`. O frontend deve usar `role` ao ler respostas da API.

## 📋 Índice

1. [Agendamento de Mentorias](#agendamento-de-mentorias)
2. [Login e Registro](#login-e-registro)
3. [Dashboard do Mentor](#dashboard-do-mentor)
4. [Dashboard Administrativa](#dashboard-administrativa)
5. [Usuários Cadastrados](#usuários-cadastrados)
6. [Feedback](#feedback)

---

## 🎓 Agendamento de Mentorias

### Página: `/` (Homepage)

#### Obter Mentores Disponíveis

**GET** `/api/mentors`

**Query Parameters:**

- `date` (opcional): `YYYY-MM-DD` - Filtra mentores disponíveis para uma data específica

**Response:**

```json
{
  "mentors": [
    {
      "id": "string",
      "name": "string",
      "specialties": ["string"],
      "availableSlots": number
    }
  ]
}
```

#### Criar Agendamento

**POST** `/api/appointments`

**Request Body:**

```json
{
  "studentName": "string",
  "studentEmail": "string",
  "grade": "string",
  "mentorId": "string",
  "subject": "string",
  "date": "string (ISO date format)",
  "time": "string (formato HH:mm)",
  "message": "string (opcional)"
}
```

**Response:**

```json
{
  "id": "string",
  "status": "pending" | "confirmed" | "completed" | "cancelled",
  "createdAt": "string (ISO date)"
}
```

---

## 🔐 Login e Registro

### Página: `/login`

#### Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "student" | "mentor" | "admin"
  }
}
```

### Página: `/register`

#### Registro

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "student" | "mentor",
  "grade": "string (opcional, apenas para estudantes)",
  "specialties": ["string"] (opcional, apenas para mentores)
}
```

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "student" | "mentor",
  "createdAt": "string (ISO date)"
}
```

---

## 👨‍🏫 Dashboard do Mentor

### Página: `/mentor/dashboard`

#### Obter Disponibilidades do Mentor

**GET** `/api/mentor/availability`

**Query Parameters:**

- `mentorId`: `string` (obrigatório)
- `date`: `YYYY-MM-DD` (opcional)

**Response:**

```json
{
  "availabilities": [
    {
      "id": "string",
      "date": "string (ISO date)",
      "time": "string (formato HH:mm)",
      "status": "available" | "booked" | "unavailable"
    }
  ]
}
```

#### Adicionar Disponibilidade (Múltiplos Horários)

**POST** `/api/mentor/availability`

**Request Body:**

```json
{
  "mentorId": "string",
  "date": "string (ISO date format)",
  "times": ["string"] (array de horários no formato "HH:mm"),
  "status": "available" | "unavailable"
}
```

**Response:**

```json
{
  "created": [
    {
      "id": "string",
      "date": "string (ISO date)",
      "time": "string",
      "status": "available" | "unavailable",
      "createdAt": "string (ISO date)"
    }
  ],
  "skipped": ["string"] (horários que já existiam, opcional)
}
```

**Nota:** Esta rota permite adicionar múltiplos horários de uma vez para a mesma data, facilitando o cadastro em lote.

#### Atualizar Status da Disponibilidade

**PATCH** `/api/mentor/availability/:id`

**Request Body:**

```json
{
  "status": "available" | "booked" | "unavailable"
}
```

**Response:**

```json
{
  "id": "string",
  "status": "available" | "booked" | "unavailable",
  "updatedAt": "string (ISO date)"
}
```

#### Remover Disponibilidade

**DELETE** `/api/mentor/availability/:id`

**Response:**

```json
{
  "message": "Disponibilidade removida com sucesso"
}
```

---

## ⚙️ Dashboard Administrativa

### Página: `/admin/dashboard`

#### Obter Configuração de Horários

**GET** `/api/admin/schedule-config`

**Response:**

```json
{
  "days": [
    {
      "day": "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
      "enabled": boolean,
      "timeSlots": [
        {
          "id": "string",
          "time": "string (formato HH:mm)",
          "enabled": boolean
        }
      ]
    }
  ]
}
```

#### Salvar Configuração de Horários

**POST** `/api/admin/schedule-config`

**Request Body:**

```json
{
  "days": [
    {
      "day": "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
      "enabled": boolean,
      "timeSlots": [
        {
          "id": "string",
          "time": "string (formato HH:mm)",
          "enabled": boolean
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "message": "Configuração salva com sucesso",
  "updatedAt": "string (ISO date)"
}
```

---

## 👥 Usuários Cadastrados

### Página: `/admin/users`

#### Listar Usuários

**GET** `/api/admin/users`

**Query Parameters:**

- `page`: `number` (opcional, padrão: 1)
- `limit`: `number` (opcional, padrão: 10)
- `search`: `string` (opcional, busca por nome ou email)
- `role`: `"student" | "mentor" | "admin"` (opcional)

**Response:**

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "role": "student" | "mentor" | "admin",
      "grade": "string (apenas para estudantes)",
      "specialties": ["string"] (apenas para mentores),
      "status": "active" | "inactive",
      "createdAt": "string (ISO date)",
      "totalMentorias": number (apenas para mentores),
      "totalAgendamentos": number (apenas para estudantes),
      "averageRating": number (apenas para mentores)
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

#### Obter Detalhes do Usuário

**GET** `/api/admin/users/:id`

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "student" | "mentor" | "admin",
  "grade": "string (opcional)",
  "specialties": ["string"] (opcional),
  "status": "active" | "inactive",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "totalMentorias": number (opcional),
  "totalAgendamentos": number (opcional),
  "averageRating": number (opcional)
}
```

---

## ⭐ Feedback

### Página: `/feedback`

#### Enviar Feedback

**POST** `/api/feedback`

**Request Body:**

```json
{
  "appointmentId": "string",
  "role": "student" | "mentor",
  "rating": number (1-5),
  "comment": "string (opcional)",
  "topics": ["string"] (opcional),
  "satisfaction": "very_satisfied" | "satisfied" | "neutral" | "dissatisfied" | "very_dissatisfied"
}
```

**Response:**

```json
{
  "id": "string",
  "appointmentId": "string",
  "role": "student" | "mentor",
  "rating": number,
  "createdAt": "string (ISO date)"
}
```

#### Obter Feedbacks de um Agendamento

**GET** `/api/feedback/appointment/:appointmentId`

**Response:**

```json
{
  "studentFeedback": {
    "id": "string",
    "rating": number,
    "comment": "string",
    "satisfaction": "string",
    "topics": ["string"],
    "createdAt": "string (ISO date)"
  } | null,
  "mentorFeedback": {
    "id": "string",
    "rating": number,
    "comment": "string",
    "satisfaction": "string",
    "topics": ["string"],
    "createdAt": "string (ISO date)"
  } | null
}
```

---

## 📝 Notas Importantes

### Formato de Datas

- Todas as datas devem ser enviadas no formato ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Para datas sem hora, use: `YYYY-MM-DD`

### Formato de Horários

- Horários devem estar no formato `HH:mm` (24 horas)
- Exemplo: `14:00`, `14:30`, `15:00`

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `500` - Erro interno do servidor

### Autenticação

- Todas as rotas protegidas devem incluir o token de autenticação no header:
  ```
  Authorization: Bearer <token>
  ```

### Validações

- E-mail deve ser válido
- Senha deve ter no mínimo 6 caracteres
- Rating deve estar entre 1 e 5
- Datas não podem ser no passado (exceto para histórico)
- Horários devem estar dentro do intervalo configurado (14:00 - 18:00)

---

## 🔄 Fluxo de Dados

### Fluxo de Agendamento

1. Estudante acessa a homepage
2. Sistema busca mentores disponíveis (`GET /api/mentors?date=YYYY-MM-DD`)
3. Estudante seleciona mentor, data e horário
4. Sistema cria agendamento (`POST /api/appointments`)
5. Sistema atualiza disponibilidade do mentor (`PATCH /api/mentor/availability/:id`)

### Fluxo de Feedback

1. Após a mentoria, sistema envia link de feedback
2. Estudante/Mentor acessa `/feedback?appointmentId=xxx&role=student|mentor`
3. Sistema envia feedback (`POST /api/feedback`)
4. Sistema atualiza estatísticas do mentor/estudante

---

## 📊 Grandes Áreas do ENEM

As áreas disponíveis para agendamento são:

- `Linguagens, Códigos e suas Tecnologias`
- `Matemática e suas Tecnologias`
- `Ciências da Natureza e suas Tecnologias`
- `Ciências Humanas e suas Tecnologias`
- `Redação`

---

## ⏰ Horários Padrão

- **Período:** Tarde (14:00 - 18:00)
- **Duração:** 30 minutos por sessão
- **Intervalos:** 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00
- **Dias da Semana:** Segunda a Sexta (configurável pelo admin)

---

**Última atualização:** 2024
