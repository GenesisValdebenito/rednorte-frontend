// ── Paciente ────────────────────────────────────────────────────────────────
export interface Paciente {
  id: number
  numRut: number
  dvRut: string
  primerNombre: string
  segundoNombre?: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string // "yyyy-MM-dd"
  email?: string
  telefono?: string
}

export interface CreatePacienteDto {
  numRut: number
  dvRut: string
  primerNombre: string
  segundoNombre?: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  email?: string
  telefono?: string
}

// ── Doctor ───────────────────────────────────────────────────────────────────
export interface Doctor {
  id: number
  numRut: number
  dvRut: string
  primerNombre: string
  apellidoPaterno: string
  especialidad: string
  email?: string
}

export interface CreateDoctorDto {
  numRut: number
  dvRut: string
  primerNombre: string
  apellidoPaterno: string
  especialidad: string
  email?: string
}

// ── Agenda / Cupos ───────────────────────────────────────────────────────────
export type EstadoCupo = 'DISPONIBLE' | 'RESERVADO' | 'COMPLETADO' | 'CANCELADO'

export interface Cupo {
  id: number
  medicoId: number
  especialidadId: number
  fecha: string
  horaInicio: string
  horaFin: string
  estado: EstadoCupo
  pacienteId?: number
}

export interface CreateCupoDto {
  medicoId: number
  especialidadId: number
  fecha: string
  horaInicio: string
  horaFin: string
}

export interface GenerarJornadaDto {
  medicoId: number
  especialidadId: number
  fecha: string
  horaInicio: string // "08:00"
  horaFin: string // "17:00"
}

export interface ReservaDto {
  cupoId: number
  pacienteId?: number
  motivoConsulta?: string
}

// ── Lista de Espera ──────────────────────────────────────────────────────────
export interface ListaEspera {
  id: number
  pacienteId: number
  especialidadId: number
  fechaIngreso: string
  prioridad: string
  motivoConsulta?: string
  estado: string
}

export interface CreateListaEsperaDto {
  pacienteId: number
  especialidadId: number
  prioridad: string
  motivoConsulta?: string
}

// ── Fichas Clínicas ──────────────────────────────────────────────────────────
export interface FichaClinica {
  id: number
  pacienteId: number
  medicoId: number
  cupoId: number
  fecha: string
  motivo?: string
  diagnostico?: string
}

export interface CreateFichaDto {
  pacienteId: number
  medicoId: number
  cupoId: number
  fecha: string
  motivo?: string
  diagnostico?: string
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export interface CitaConDoctor {
  id: number
  especialidadId: number
  fecha: string
  horaInicio: string
  horaFin: string
  estado: string
  nombreDoctor?: string
  especialidadDoctor?: string
}

export interface DashboardPaciente {
  paciente: Paciente
  fichasClinicas: FichaClinica[]
  citas: CitaConDoctor[]
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string
  username: string
  rol: 'ADMIN' | 'DOCTOR' | 'PACIENTE'
  personaId: number | null
}

export interface CancelResponse {
  cupoId: number
  estado: string
  numRut: number
  pacienteId: number
  reasignacion?: {
    reasignado: boolean
    id?: number
    pacienteId?: number
    prioridad?: string
    mensaje?: string
  }
}

// ── Home ──────────────────────────────────────────────────────────────────────
export interface CitaConPaciente {
  id: number
  fecha: string
  horaInicio: string
  horaFin: string
  estado: string
  nombrePaciente: string
  rutPaciente: string
}

export interface DoctorHome {
  id: number
  nombre: string
  especialidad: string
  cuposHoy: CitaConPaciente[]
}

export interface PacienteHome {
  datosPersonales: Paciente
  proximasCitas: CitaConDoctor[]
  ultimasFichas: FichaClinica[]
  estadoListaEspera: ListaEspera[]
}
