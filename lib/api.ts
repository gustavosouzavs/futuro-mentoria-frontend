/**
 * API client for the Futuro Mentoria backend (axios).
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3333).
 * Rotas conforme API_DOCUMENTATION.md / futuro-mentoria-backend.
 *
 * Autorização: sessão via cookie. O backend (Adonis) define o cookie no login;
 * o cliente envia automaticamente com withCredentials: true.
 * Nome do cookie: ver AUTH_COOKIE_NAME em @/lib/auth-config (padrão: adonis-session).
 */

import axios, { type AxiosRequestConfig } from "axios";
import { AUTH_COOKIE_NAME } from "@/lib/auth-config";

export { AUTH_COOKIE_NAME };

const baseURL = process.env.NEXT_PUBLIC_API_URL || "";

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ?? err.message ?? "Erro na requisição";
    throw new Error(message);
  }
);

/** Retorna data da resposta (axios coloca payload em .data). */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await client.request<T>(config);
  return data;
}

export const api = {
  get<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...options, method: "GET", url: path });
  },
  post<T>(path: string, body?: unknown, options?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...options, method: "POST", url: path, data: body });
  },
  patch<T>(path: string, body?: unknown, options?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...options, method: "PATCH", url: path, data: body });
  },
  delete<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...options, method: "DELETE", url: path });
  },
};

// --- Tipos conforme API_DOCUMENTATION.md ---

export type UserType = "student" | "mentor" | "admin";

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token?: string; user: { id: string; name: string; email: string; role: UserType } }>(
      "/api/auth/login",
      { email, password }
    ),
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "student" | "mentor";
    grade?: string;
    specialties?: string[];
  }) =>
    api.post<{ id: string; name: string; email: string; role: "student" | "mentor"; createdAt: string }>(
      "/api/auth/register",
      data
    ),
  logout: () => api.post<{ message: string }>("/api/auth/logout"),
  me: () =>
    api.get<{ user: { id: string; name: string; email: string; role: UserType } }>("/api/auth/me"),
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.patch<{ message: string }>("/api/auth/change-password", data),
};

// Mentores (público)
export const mentorsApi = {
  list: (date?: string) =>
    api.get<{
      mentors: { id: string; name: string; specialties: string[]; availableSlots: number, availableTimes: string[] }[];
    }>(`/api/mentors${date ? `?date=${date}` : ""}`),
};

// Agendamentos (público - criar)
export const appointmentsApi = {
  create: (data: {
    studentName: string;
    studentEmail: string;
    grade: string;
    mentorId: string;
    subject: string;
    date: string;
    time: string;
    message?: string;
    preparationItems?: string[];
    studentId: number | string;
  }) =>
    api.post<{ id: string; status: string; createdAt: string }>("/api/appointments", data),
};

// Mentor - disponibilidades (rotas da doc)
export const mentorAvailabilityApi = {
  list: (mentorId: string, date?: string) => {
    const params = new URLSearchParams({ mentorId });
    if (date) params.set("date", date);
    return api.get<{
      availabilities: Array<{
        id: string;
        date: string;
        time: string;
        status: "available" | "booked" | "unavailable";
      }>;
    }>(`/api/mentor/availability?${params.toString()}`);
  },
  create: (data: {
    mentorId: string;
    date: string;
    times: string[];
    status: "available" | "unavailable";
  }) =>
    api.post<{
      created: Array<{ id: string; date: string; time: string; status: string; createdAt: string }>;
      skipped?: string[];
    }>("/api/mentor/availability", data),
  update: (id: string, data: { status: "available" | "booked" | "unavailable" }) =>
    api.patch<{ id: string; status: string; updatedAt: string }>(
      `/api/mentor/availability/${id}`,
      data
    ),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/mentor/availability/${id}`),
};

// Feedback
export type Satisfaction =
  | "very_satisfied"
  | "satisfied"
  | "neutral"
  | "dissatisfied"
  | "very_dissatisfied";

export const feedbackApi = {
  create: (data: {
    appointmentId: string;
    userType: "student" | "mentor";
    rating: number;
    comment?: string;
    topics?: string[];
    satisfaction: Satisfaction;
    isPublic?: boolean;
  }) =>
    api.post<{ id: string; appointmentId: string; userType: string; rating: number; createdAt: string }>(
      "/api/feedback",
      data
    ),
  getByAppointment: (appointmentId: string) =>
    api.get<{
      studentFeedback: {
        id: string;
        rating: number;
        comment: string | null;
        satisfaction: string;
        topics: string[];
        createdAt: string;
      } | null;
      mentorFeedback: {
        id: string;
        rating: number;
        comment: string | null;
        satisfaction: string;
        topics: string[];
        createdAt: string;
      } | null;
    }>(`/api/feedback/appointment/${appointmentId}`),
};

// Admin - configuração de horários
export const adminScheduleApi = {
  get: () =>
    api.get<{
      days: Array<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
        enabled: boolean;
        timeSlots: Array<{ id: string; time: string; enabled: boolean }>;
      }>;
    }>("/api/admin/schedule-config"),
  save: (data: {
    days: Array<{
      day: string;
      enabled: boolean;
      timeSlots: Array<{ id: string; time: string; enabled: boolean }>;
    }>;
  }) =>
    api.post<{ message: string; updatedAt: string }>("/api/admin/schedule-config", data),
};

// Mentor - leitura das configurações que o admin bloqueou/permitted
export const mentorScheduleApi = {
  get: () =>
    api.get<{
      days: Array<{
        day: string;
        enabled: boolean;
        timeSlots: Array<{ id: string; time: string; enabled: boolean }>;
      }>;
    }>("/api/mentor/schedule-config"),
};

// Admin - métricas
export const adminMetricsApi = {
  get: () =>
    api.get<{
      totalUsers: number;
      totalStudents: number;
      totalMentors: number;
      totalAppointments: number;
      totalFeedbacks: number;
      appointmentsByStatus: Record<string, number>;
      averageRating: number | null;
      appointmentsLast30Days: number;
      completedLast30Days: number;
      appointmentsWithoutStudentFeedback: number;
    }>("/api/admin/metrics"),
};

// Admin - usuários
export const adminUsersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: UserType }) => {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    if (params?.search) sp.set("search", params.search);
    if (params?.role) sp.set("role", params.role);
    const q = sp.toString();
    return api.get<{
      users: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: UserType;
        grade?: string;
        specialties?: string[];
        status: "active" | "inactive";
        createdAt: string;
        totalMentorias?: number;
        totalAgendamentos?: number;
        averageRating?: number;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/users${q ? `?${q}` : ""}`);
  },
  get: (id: string) =>
    api.get<{
      id: string;
      name: string;
      email: string;
      phone: string;
      role: UserType;
      grade?: string;
      specialties?: string[];
      status: string;
      createdAt: string;
      updatedAt: string;
      totalMentorias?: number;
      totalAgendamentos?: number;
      averageRating?: number;
    }>(`/api/admin/users/${id}`),
  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: UserType;
      grade?: string;
      specialties?: string[];
      status?: "active" | "inactive";
      password?: string;
    }
  ) =>
    api.patch<{ id: string; message: string }>(`/api/admin/users/${id}`, data),
};

// Admin - importação de estudantes (multipart)
export const adminStudentsImportApi = {
  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.request<{
      message: string;
      created: number;
      skipped: number;
      details: { created: Array<{ id: number; name: string; email: string }>; skipped: Array<{ row: number; reason: string }> };
    }>({
      method: "POST",
      url: "/api/admin/students/import",
      data: formData,
      headers: { "Content-Type": undefined },
    }).then((res) => res.data);
  },
};

// Student appointments (rotas extras do backend, se existirem)
export const studentAppointmentsApi = {
  list: () =>
    api.get<{
      appointments: Array<{
        id: string;
        mentorName: string;
        subject: string;
        date: string;
        time: string;
        status: string;
        hasFeedback: boolean;
        hasMaterial: boolean;
        hasMessage: boolean;
        needsPreparation: boolean;
      }>;
    }>("/api/student/appointments"),
  get: (id: string) =>
    api.get<{
      id: string;
      mentorName: string;
      mentorEmail: string;
      subject: string;
      date: string;
      time: string;
      status: string;
      message?: string;
      preparationItems?: string[];
      materials: Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>;
      hasFeedback: boolean;
    }>(`/api/student/appointments/${id}`),
  updatePreparationItems: (id: string, preparationItems: string[]) =>
    api.patch<{ message: string }>(`/api/student/appointments/${id}/preparation-items`, {
      preparationItems,
    }),
};

// Mentor appointments (rotas extras do backend, se existirem)
export const mentorAppointmentsApi = {
  list: () =>
    api.get<{
      appointments: Array<{
        id: string;
        studentName: string;
        studentEmail: string;
        subject: string;
        date: string;
        time: string;
        status: string;
        hasFeedback: boolean;
        hasMaterial: boolean;
        hasMessage: boolean;
      }>;
    }>("/api/mentor/appointments"),
  get: (id: string) =>
    api.get<{
      id: string;
      studentName: string;
      studentEmail: string;
      studentPhone?: string;
      subject: string;
      date: string;
      time: string;
      status: string;
      message?: string;
      preparationItems?: string[];
      materials: Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>;
      hasFeedback?: boolean;
    }>(`/api/mentor/appointments/${id}`),
  update: (
    id: string,
    data: { message?: string; preparationItems?: string[]; status?: string }
  ) => api.patch<{ message: string }>(`/api/mentor/appointments/${id}`, data),
  addMaterial: (
    id: string,
    data: { name: string; url: string; type: "pdf" | "doc" | "link" | "other" }
  ) =>
    api.post<{ id: string; name: string; url: string; type: string; uploadedAt: string }>(
      `/api/mentor/appointments/${id}/materials`,
      data
    ),
};

// --- Salas e reservas (backend: rooms, room_reservations) ---

export type RoomDto = {
  id: number;
  name: string;
  code: string | null;
  location: string | null;
  createdAt?: string;
};

export type RoomReservationDto = {
  roomId: number;
  roomName: string;
  roomCode: string | null;
  mentorId: number;
  mentorName: string;
  date: string;
  reservedFrom: string | null;
  reservedUntil: string | null;
};

// Público: qual sala tem qual mentor e até qual horário (por data)
export const roomReservationsApi = {
  getByDate: (date: string) =>
    api.get<{ date: string; reservations: RoomReservationDto[] }>(
      `/api/rooms/reservations?date=${date}`
    ),
};

// Admin: CRUD de salas
export const adminRoomsApi = {
  list: () => api.get<{ rooms: RoomDto[] }>("/api/admin/rooms"),
  create: (data: { name: string; code?: string; location?: string }) =>
    api.post<RoomDto>("/api/admin/rooms", data),
  update: (id: number, data: { name?: string; code?: string; location?: string }) =>
    api.patch<RoomDto>(`/api/admin/rooms/${id}`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/api/admin/rooms/${id}`),
};

// Mentor: listar salas, minhas reservas, reservar, cancelar
export const mentorRoomsApi = {
  listRooms: () => api.get<{ rooms: RoomDto[] }>("/api/mentor/rooms"),
  myReservations: (params?: { dateFrom?: string; dateTo?: string }) => {
    const sp = new URLSearchParams();
    if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
    if (params?.dateTo) sp.set("dateTo", params.dateTo);
    const q = sp.toString();
    return api.get<{
      reservations: Array<{
        id: number;
        roomId: number;
        roomName: string;
        roomCode: string | null;
        date: string;
        reservedFrom: string | null;
        reservedUntil: string | null;
      }>;
    }>(`/api/mentor/room-reservations${q ? `?${q}` : ""}`);
  },
  reserve: (data: { roomId: number; date: string; reservedFrom: string; reservedUntil: string }) =>
    api.post<{
      id: number;
      roomId: number;
      roomName: string;
      date: string;
      reservedFrom: string | null;
      reservedUntil: string | null;
      message: string;
    }>("/api/mentor/room-reservations", data),
  cancelReservation: (id: number) =>
    api.delete<{ message: string }>(`/api/mentor/room-reservations/${id}`),
};
