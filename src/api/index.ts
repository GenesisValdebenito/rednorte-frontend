import { client } from './client'
import type {
  Paciente, CreatePacienteDto,
  Doctor, CreateDoctorDto,
  Cupo, CreateCupoDto, GenerarJornadaDto, ReservaDto,
  ListaEspera, CreateListaEsperaDto,
  FichaClinica, CreateFichaDto,
  DashboardPaciente,
  AuthResponse, CancelResponse,
  DoctorHome, PacienteHome,
} from '../types'

// ── Pacientes ──────────────────────────────────────────────────────────────
export const pacientesApi = {
  crear: (dto: CreatePacienteDto) =>
    client.post<Paciente>('/pacientes', dto).then(r => r.data),

  getById: (id: number) =>
    client.get<Paciente>(`/pacientes/${id}`).then(r => r.data),

  getByRut: (numRut: number) =>
    client.get<Paciente>(`/pacientes/rut/${numRut}`).then(r => r.data),

  buscarPorNombre: (nombre: string, apellido?: string) =>
    client.get<Paciente[]>('/pacientes/buscar', { params: { nombre, apellido } }).then(r => r.data),

  getMisFichas: () =>
    client.get<FichaClinica[]>('/pacientes/mis-fichas').then(r => r.data),
}

// ── Doctores ───────────────────────────────────────────────────────────────
export const doctoresApi = {
  listar: () =>
    client.get<Doctor[]>('/doctores').then(r => r.data),

  getById: (id: number) =>
    client.get<Doctor>(`/doctores/${id}`).then(r => r.data),

  crear: (dto: CreateDoctorDto) =>
    client.post<Doctor>('/doctores', dto).then(r => r.data),
}

// ── Agenda ─────────────────────────────────────────────────────────────────
export const agendaApi = {
  disponibilidad: (especialidadId: number) =>
    client.get<Cupo[]>('/agenda/disponibilidad', {
      params: { especialidadId },
    }).then(r => r.data),

  cuposHoy: (especialidadId: number) =>
    client.get<Cupo[]>('/dashboard/agenda/hoy', {
      params: { especialidadId },
    }).then(r => r.data),

  crearCupo: (dto: CreateCupoDto) =>
    client.post<Cupo>('/agenda/cupos', dto).then(r => r.data),

  generarJornada: (dto: GenerarJornadaDto) =>
    client.post<Cupo[]>('/agenda/generar-jornada', dto).then(r => r.data),

  reservar: (dto: ReservaDto) =>
    client.post<Cupo>('/agenda/reserva', dto).then(r => r.data),

  cancelarPorRut: (numRut: number, cupoId: number) =>
    client.post<CancelResponse>('/agenda/cancelar-por-rut', { numRut, cupoId }).then(r => r.data),

  misCupos: (especialidadId: number) =>
    client.get<Cupo[]>('/agenda/mis-cupos', { params: { especialidadId } }).then(r => r.data),

  misHorasHoy: (especialidadId: number) =>
    client.get<any[]>('/agenda/mis-horas-hoy', { params: { especialidadId } }).then(r => r.data),
}

// ── Lista de Espera ────────────────────────────────────────────────────────
export const listaEsperaApi = {
  listar: () =>
    client.get<ListaEspera[]>('/lista-espera').then(r => r.data),

  inscribir: (dto: CreateListaEsperaDto) =>
    client.post<ListaEspera>('/lista-espera', dto).then(r => r.data),

  inscribirPorRut: (dto: { numRut: number; especialidadId: number; prioridad: string; motivoConsulta?: string }) =>
    client.post<ListaEspera>('/lista-espera/inscribir-por-rut', dto).then(r => r.data),
}

// ── Fichas Clínicas ────────────────────────────────────────────────────────
export const fichasApi = {
  crear: (dto: CreateFichaDto) =>
    client.post<FichaClinica>('/fichas', dto).then(r => r.data),

  crearPorRut: (dto: { numRut: number; cupoId: number; fecha?: string; motivo?: string; diagnostico?: string }) =>
    client.post<FichaClinica>('/fichas/crear-por-rut', dto).then(r => r.data),

  getMisFichas: () =>
    client.get<FichaClinica[]>('/fichas/mis-fichas').then(r => r.data),
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardApi = {
  getPaciente: (numRut: number) =>
    client.get<DashboardPaciente>(`/dashboard/paciente/${numRut}`).then(r => r.data),
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { username, password }).then(r => r.data),

  register: (dto: {
    username: string; password: string; primerNombre: string; segundoNombre?: string
    apellidoPaterno: string; apellidoMaterno: string; fechaNacimiento: string
    email?: string; telefono?: string
  }) =>
    client.post<AuthResponse>('/auth/register', dto).then(r => r.data),
}

// ── Home ─────────────────────────────────────────────────────────────────────
export const homeApi = {
  getDoctorHome: () =>
    client.get<DoctorHome>('/home/doctor').then(r => r.data),

  getPacienteHome: () =>
    client.get<PacienteHome>('/home/paciente').then(r => r.data),
}
